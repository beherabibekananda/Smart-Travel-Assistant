from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_active_user

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.put("/me", response_model=schemas.User)
def update_user_profile(
    user_update: schemas.UserCreate, # Using UserCreate for simplicity, ideally UserUpdate
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update current user profile."""
    current_user.name = user_update.name
    current_user.age = user_update.age
    current_user.diet_type = user_update.diet_type
    current_user.daily_food_budget = user_update.daily_food_budget
    current_user.hotel_budget_per_night = user_update.hotel_budget_per_night
    if user_update.avatar_url:
        current_user.avatar_url = user_update.avatar_url
    
    db.commit()
    db.refresh(current_user)
    return current_user

# Favorites
@router.post("/favorites/{place_id}", response_model=schemas.Favorite)
def add_favorite(
    place_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    existing = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.place_id == place_id
    ).first()
    
    if existing:
        return existing
        
    favorite = models.Favorite(user_id=current_user.id, place_id=place_id)
    db.add(favorite)
    db.commit()
    db.refresh(favorite)
    return favorite

@router.get("/favorites", response_model=List[schemas.Favorite])
def get_favorites(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Favorite).filter(models.Favorite.user_id == current_user.id).all()

@router.delete("/favorites/{place_id}")
def remove_favorite(
    place_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.place_id == place_id
    ).delete()
    db.commit()
    return {"message": "Favorite removed"}

# Search History
@router.post("/history", response_model=schemas.SearchHistory)
def add_search_history(
    history: schemas.SearchHistoryCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_history = models.SearchHistory(
        user_id=current_user.id,
        query=history.query,
        location=history.location
    )
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history

@router.get("/history", response_model=List[schemas.SearchHistory])
def get_search_history(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(models.SearchHistory).filter(
        models.SearchHistory.user_id == current_user.id
    ).order_by(models.SearchHistory.timestamp.desc()).limit(10).all()

@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
