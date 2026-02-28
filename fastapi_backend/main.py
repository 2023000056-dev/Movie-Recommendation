from fastapi import FastAPI, Depends, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import httpx
import os
from dotenv import load_dotenv
from typing import List, Optional

import models
import schemas
import database

load_dotenv()

# Security Config
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-for-dev") # Change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 # 1 day

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Create tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="CineScope API (FastAPI)")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TMDB_API_KEY = os.getenv("VITE_TMDB_API_KEY")
TMDB_BASE_URL = "https://api.themoviedb.org/3"

# --- Auth Helpers ---
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

# --- Auth Endpoints ---
@app.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_pwd = get_password_hash(user.password)
    new_user = models.User(username=user.username, email=user.email, hashed_password=get_password_hash(user.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    print(f"DEBUG: New user registered: {new_user.username} ({new_user.email})")
    return new_user

@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    # Record login in database
    new_log = models.LoginLog(
        user_id=user.id,
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent")
    )
    db.add(new_log)
    db.commit()
    
    print(f"DEBUG: User logged in: {user.username} from {request.client.host}")
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

# --- TMDB Proxy Endpoints ---
@app.get("/api/tmdb/{path:path}")
async def tmdb_proxy(path: str, request: Request):
    params = dict(request.query_params)
    params["api_key"] = TMDB_API_KEY
    
    url = f"{TMDB_BASE_URL}/{path}"
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, params=params)
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

# --- Favorites & Ratings ---
@app.post("/api/favorites", response_model=schemas.FavoriteMovie)
def add_favorite(movie: schemas.FavoriteMovieCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    db_movie = db.query(models.FavoriteMovie).filter(
        models.FavoriteMovie.tmdb_id == movie.tmdb_id,
        models.FavoriteMovie.user_id == current_user.id
    ).first()
    
    if db_movie:
        return db_movie
    
    new_favorite = models.FavoriteMovie(**movie.dict(), user_id=current_user.id)
    db.add(new_favorite)
    db.commit()
    db.refresh(new_favorite)
    return new_favorite

@app.get("/api/favorites", response_model=List[schemas.FavoriteMovie])
def get_favorites(db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.FavoriteMovie).filter(models.FavoriteMovie.user_id == current_user.id).all()

@app.delete("/api/favorites/{tmdb_id}")
def remove_favorite(tmdb_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(get_current_user)):
    db_movie = db.query(models.FavoriteMovie).filter(
        models.FavoriteMovie.tmdb_id == tmdb_id,
        models.FavoriteMovie.user_id == current_user.id
    ).first()
    
    if not db_movie:
        raise HTTPException(status_code=404, detail="Movie not found in favorites")
    
    db.delete(db_movie)
    db.commit()
    return {"message": "Movie removed from favorites"}

@app.get("/")
async def root():
    return {"message": "CineScope API is online"}
