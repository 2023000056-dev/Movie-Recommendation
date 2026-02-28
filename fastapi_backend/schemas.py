from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    
    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Favorite Movie Schemas
class FavoriteMovieBase(BaseModel):
    tmdb_id: int
    title: str
    poster_path: Optional[str] = None
    media_type: Optional[str] = "movie"

class FavoriteMovieCreate(FavoriteMovieBase):
    pass

class FavoriteMovie(FavoriteMovieBase):
    id: int
    user_id: int
    added_at: datetime

    class Config:
        from_attributes = True

# Rating Schemas
class MovieRatingBase(BaseModel):
    tmdb_id: int
    rating: float

class MovieRatingCreate(MovieRatingBase):
    pass

class MovieRating(MovieRatingBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True
