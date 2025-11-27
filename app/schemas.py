from typing import List, Optional
from pydantic import BaseModel, EmailStr
from .models import DietType, PlaceType, BookingType, BookingStatus
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    age: int
    diet_type: DietType
    daily_food_budget: float
    hotel_budget_per_night: float
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

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
    city: Optional[str] = None
    state: Optional[str] = None
    formatted_address: Optional[str] = None

class Place(PlaceBase):
    id: str
    # diet_compatibility_score and final_score will be added dynamically in responses
    diet_compatibility_score: Optional[float] = None
    final_score: Optional[float] = None
    distance_km: Optional[float] = None

    class Config:
        from_attributes = True

# Booking Schemas
class BookingBase(BaseModel):
    user_id: str
    place_id: str
    booking_type: BookingType

class BookingCreate(BookingBase):
    pass

class Booking(BookingBase):
    id: str
    timestamp: datetime
    status: BookingStatus
    place: Optional[Place] = None

    class Config:
        from_attributes = True

# Recommendation Request Schemas
class RestaurantRecommendationRequest(BaseModel):
    user_id: str
    current_lat: float
    current_lon: float
    radius_km: float
    planned_meal_time: Optional[str] = None

class HotelRecommendationRequest(BaseModel):
    user_id: str
    current_lat: float
    current_lon: float
    radius_km: float

class HospitalRecommendationRequest(BaseModel):
    current_lat: float
    current_lon: float
    radius_km: float

# Payment Schemas
class PaymentOrderCreate(BaseModel):
    booking_id: str
    amount: float

class PaymentOrderResponse(BaseModel):
    order_id: str
    amount: float
    currency: str
    razorpay_key_id: str

class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    booking_id: str

class TransactionResponse(BaseModel):
    id: str
    booking_id: str
    razorpay_order_id: str
    razorpay_payment_id: Optional[str]
    amount: float
    currency: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# History and Favorites
class SearchHistoryCreate(BaseModel):
    query: str
    location: Optional[str] = None

class SearchHistory(SearchHistoryCreate):
    id: str
    user_id: str
    timestamp: datetime

    class Config:
        from_attributes = True

class FavoriteCreate(BaseModel):
    place_id: str

class Favorite(BaseModel):
    id: str
    user_id: str
    place_id: str
    timestamp: datetime
    place: Place

    class Config:
        from_attributes = True

# Review Schemas
class ReviewCreate(BaseModel):
    place_id: str
    rating: float  # 1-5
    comment: str

class ReviewUpdate(BaseModel):
    rating: Optional[float] = None
    comment: Optional[str] = None

class Review(BaseModel):
    id: str
    user_id: str
    place_id: str
    rating: float
    comment: str
    helpful_count: int
    timestamp: datetime
    user: Optional[User] = None

    class Config:
        from_attributes = True

