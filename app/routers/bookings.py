from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(
    prefix="/bookings",
    tags=["bookings"],
)

@router.post("/", response_model=schemas.Booking)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    # Validate User
    user = db.query(models.User).filter(models.User.id == booking.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Validate Place
    place = db.query(models.Place).filter(models.Place.id == booking.place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
        
    # Validate Booking Type matches Place Type
    # Note: PlaceType enum values are "RESTAURANT", "HOTEL", "HOSPITAL"
    # BookingType enum values are "RESTAURANT", "HOTEL"
    if place.place_type.value != booking.booking_type.value:
         raise HTTPException(status_code=400, detail=f"Place type {place.place_type} does not match booking type {booking.booking_type}")

    db_booking = models.Booking(**booking.dict())
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    
    # Send Confirmation Email (Mock)
    from ..services.email_service import email_service
    email_service.send_booking_confirmation(
        email=user.email,
        booking_details={
            "user_name": user.name,
            "place_name": place.name,
            "date": str(db_booking.timestamp),
            "status": db_booking.status
        }
    )
    
    return db_booking

@router.get("/user/{user_id}", response_model=List[schemas.Booking])
def read_user_bookings(user_id: int, db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).filter(models.Booking.user_id == user_id).all()
    return bookings

@router.post("/{booking_id}/cancel", response_model=schemas.Booking)
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    booking.status = models.BookingStatus.CANCELLED
    db.commit()
    db.refresh(booking)
    return booking
