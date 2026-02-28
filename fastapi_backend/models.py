from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    favorites = relationship("FavoriteMovie", back_populates="user")
    ratings = relationship("MovieRating", back_populates="user")
    logins = relationship("LoginLog", back_populates="user")

class FavoriteMovie(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, index=True)
    title = Column(String, index=True)
    poster_path = Column(String, nullable=True)
    media_type = Column(String, default="movie")
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="favorites")

class MovieRating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, index=True)
    rating = Column(Float)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="ratings")

class LoginLog(Base):
    __tablename__ = "login_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    login_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="logins")
