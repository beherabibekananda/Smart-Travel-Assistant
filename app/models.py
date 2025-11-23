from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, Enum, JSON, DateTime
from sqlalchemy.orm import relationship
from .database import Base
import enum
from datetime import datetime

class DietType(str, enum.Enum):
    VEG = "VEG"
    VEGAN = "VEGAN"
    JAIN = "JAIN"
    NON_VEG_NO_BEEF = "NON_VEG_NO_BEEF"
    LOW_CARB = "LOW_CARB"
    DIABETIC_FRIENDLY = "DIABETIC_FRIENDLY"

class PlaceType(str, enum.Enum):
    RESTAURANT = "RESTAURANT"
    HOTEL = "HOTEL"
    HOSPITAL = "HOSPITAL"

class BookingType(str, enum.Enum):
    HOTEL = "HOTEL"
    RESTAURANT = "RESTAURANT"

class BookingStatus(str, enum.Enum):
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer)
    diet_type = Column(Enum(DietType))
    daily_food_budget = Column(Float)
    hotel_budget_per_night = Column(Float)

    bookings = relationship("Booking", back_populates="user")

class Place(Base):
    __tablename__ = "places"

    id = Column(Integer, primary_key=True, index=True)
    google_place_id = Column(String, unique=True, nullable=True)
    name = Column(String, index=True)
    place_type = Column(Enum(PlaceType))
    latitude = Column(Float)
    longitude = Column(Float)
    rating = Column(Float)
    avg_cost_for_two = Column(Float, nullable=True) # For restaurants
    price_per_night = Column(Float, nullable=True) # For hotels
    tags = Column(JSON) # List of strings

    menu_items = relationship("MenuItem", back_populates="place")
    bookings = relationship("Booking", back_populates="place")

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("places.id"))
    item_name = Column(String)
    description = Column(String)
    tags = Column(JSON) # List of strings

    place = relationship("Place", back_populates="menu_items")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    place_id = Column(Integer, ForeignKey("places.id"))
    booking_type = Column(Enum(BookingType))
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(BookingStatus), default=BookingStatus.CONFIRMED)

    user = relationship("User", back_populates="bookings")
    place = relationship("Place", back_populates="bookings")
