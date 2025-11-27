from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from .. import models, schemas
from ..auth import get_current_active_user

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

@router.put("/me", response_model=schemas.User)
async def update_user_profile(
    user_update: schemas.UserCreate,  # Using UserCreate for simplicity, ideally UserUpdate
    current_user: models.User = Depends(get_current_active_user),
):
    """Update current user profile."""
    current_user.name = user_update.name
    current_user.age = user_update.age
    current_user.diet_type = user_update.diet_type
    current_user.daily_food_budget = user_update.daily_food_budget
    current_user.hotel_budget_per_night = user_update.hotel_budget_per_night
    if user_update.avatar_url:
        current_user.avatar_url = user_update.avatar_url
    
    await current_user.save()
    return current_user

# Favorites
@router.post("/favorites/{place_id}", response_model=schemas.Favorite)
async def add_favorite(
    place_id: str,
    current_user: models.User = Depends(get_current_active_user),
):
    # Check if favorite already exists
    existing = await models.Favorite.find_one(
        models.Favorite.user_id == current_user.id,
        models.Favorite.place_id == ObjectId(place_id)
    )
    
    if existing:
        return existing
        
    favorite = models.Favorite(user_id=current_user.id, place_id=ObjectId(place_id))
    await favorite.insert()
    return favorite

@router.get("/favorites", response_model=List[schemas.Favorite])
async def get_favorites(
    current_user: models.User = Depends(get_current_active_user),
):
    return await models.Favorite.find(models.Favorite.user_id == current_user.id).to_list()

@router.delete("/favorites/{place_id}")
async def remove_favorite(
    place_id: str,
    current_user: models.User = Depends(get_current_active_user),
):
    favorite = await models.Favorite.find_one(
        models.Favorite.user_id == current_user.id,
        models.Favorite.place_id == ObjectId(place_id)
    )
    if favorite:
        await favorite.delete()
    return {"message": "Favorite removed"}

# Search History
@router.post("/history", response_model=schemas.SearchHistory)
async def add_search_history(
    history: schemas.SearchHistoryCreate,
    current_user: models.User = Depends(get_current_active_user),
):
    db_history = models.SearchHistory(
        user_id=current_user.id,
        query=history.query,
        location=history.location
    )
    await db_history.insert()
    return db_history

@router.get("/history", response_model=List[schemas.SearchHistory])
async def get_search_history(
    current_user: models.User = Depends(get_current_active_user),
):
    return await models.SearchHistory.find(
        models.SearchHistory.user_id == current_user.id
    ).sort(-models.SearchHistory.timestamp).limit(10).to_list()

@router.post("/", response_model=schemas.User)
async def create_user(user: schemas.UserCreate):
    db_user = models.User(**user.dict())
    await db_user.insert()
    return db_user

@router.get("/{user_id}", response_model=schemas.User)
async def read_user(user_id: str):
    db_user = await models.User.get(ObjectId(user_id))
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user
