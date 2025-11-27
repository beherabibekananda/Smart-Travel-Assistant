from beanie import Document, Link
from pydantic import Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum
from bson import ObjectId

# Pydantic ObjectId for MongoDB
class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")

# Enums
class DietType(str, Enum):
    VEG = "VEG"
    VEGAN = "VEGAN"
    JAIN = "JAIN"
    NON_VEG_NO_BEEF = "NON_VEG_NO_BEEF"
    LOW_CARB = "LOW_CARB"
    DIABETIC_FRIENDLY = "DIABETIC_FRIENDLY"

class PlaceType(str, Enum):
    RESTAURANT = "RESTAURANT"
    HOTEL = "HOTEL"
    HOSPITAL = "HOSPITAL"

class BookingType(str, Enum):
    HOTEL = "HOTEL"
    RESTAURANT = "RESTAURANT"

class BookingStatus(str, Enum):
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"

class PaymentStatus(str, Enum):
    CREATED = "CREATED"
    AUTHORIZED = "AUTHORIZED"
    CAPTURED = "CAPTURED"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

# Document Models
class User(Document):
    email: EmailStr
    hashed_password: str
    name: Optional[str] = None
    age: Optional[int] = None
    diet_type: Optional[DietType] = None
    daily_food_budget: Optional[float] = None
    hotel_budget_per_night: Optional[float] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    reset_token: Optional[str] = None
    reset_token_expiry: Optional[datetime] = None
    avatar_url: Optional[str] = None
    email_verified: bool = False
    otp_code: Optional[str] = None
    otp_expiry: Optional[datetime] = None

    class Settings:
        name = "users"
        indexes = [
            "email",
        ]

class Place(Document):
    google_place_id: Optional[str] = None
    name: str
    place_type: PlaceType
    latitude: float
    longitude: float
    rating: Optional[float] = None
    avg_cost_for_two: Optional[float] = None  # For restaurants
    price_per_night: Optional[float] = None  # For hotels
    tags: List[str] = []
    city: Optional[str] = None
    state: Optional[str] = None
    formatted_address: Optional[str] = None

    class Settings:
        name = "places"
        indexes = [
            "name",
            "place_type",
            "google_place_id",
        ]

class MenuItem(Document):
    restaurant_id: ObjectId  # Reference to Place
    item_name: str
    description: Optional[str] = None
    tags: List[str] = []

    class Settings:
        name = "menu_items"
    
    class Config:
        arbitrary_types_allowed = True

class Booking(Document):
    user_id: ObjectId  # Reference to User
    place_id: ObjectId  # Reference to Place
    booking_type: BookingType
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: BookingStatus = BookingStatus.CONFIRMED

    class Settings:
        name = "bookings"
    
    class Config:
        arbitrary_types_allowed = True

class Transaction(Document):
    booking_id: ObjectId  # Reference to Booking (unique)
    razorpay_order_id: str
    razorpay_payment_id: Optional[str] = None
    razorpay_signature: Optional[str] = None
    amount: float  # Amount in INR
    currency: str = "INR"
    status: PaymentStatus = PaymentStatus.CREATED
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "transactions"
        indexes = [
            "razorpay_order_id",
            "razorpay_payment_id",
            "booking_id",
        ]
    
    class Config:
        arbitrary_types_allowed = True

class SearchHistory(Document):
    user_id: ObjectId  # Reference to User
    query: str
    location: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "search_history"
    
    class Config:
        arbitrary_types_allowed = True

class Favorite(Document):
    user_id: ObjectId  # Reference to User
    place_id: ObjectId  # Reference to Place
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "favorites"
    
    class Config:
        arbitrary_types_allowed = True

class Review(Document):
    user_id: ObjectId  # Reference to User
    place_id: ObjectId  # Reference to Place
    rating: float  # 1-5 stars
    comment: Optional[str] = None
    helpful_count: int = 0
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "reviews"
    
    class Config:
        arbitrary_types_allowed = True
