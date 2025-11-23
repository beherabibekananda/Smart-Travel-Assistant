from typing import List, Optional
from pydantic import BaseModel
from .models import DietType, PlaceType, BookingType, BookingStatus
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    name: str
    age: int
    diet_type: DietType
    daily_food_budget: float
    hotel_budget_per_night: float

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int

    class Config:
        orm_mode = True

# Place Schemas
class PlaceBase(BaseModel):
    name: str
    place_type: PlaceType
    latitude: float
    longitude: float
    rating: float
    avg_cost_for_two: Optional[float] = None
    price_per_night: Optional[float] = None
    tags: List[str] = []

class Place(PlaceBase):
    id: int
    # diet_compatibility_score and final_score will be added dynamically in responses
    diet_compatibility_score: Optional[float] = None
    final_score: Optional[float] = None
    distance_km: Optional[float] = None

    class Config:
        orm_mode = True

# Booking Schemas
class BookingBase(BaseModel):
    user_id: int
    place_id: int
    booking_type: BookingType

class BookingCreate(BookingBase):
    pass

class Booking(BookingBase):
    id: int
    timestamp: datetime
    status: BookingStatus

    class Config:
        orm_mode = True

# Recommendation Request Schemas
class RestaurantRecommendationRequest(BaseModel):
    user_id: int
    current_lat: float
    current_lon: float
    radius_km: float
    planned_meal_time: Optional[str] = None

class HotelRecommendationRequest(BaseModel):
    user_id: int
    current_lat: float
    current_lon: float
    radius_km: float

class HospitalRecommendationRequest(BaseModel):
    current_lat: float
    current_lon: float
    radius_km: float
