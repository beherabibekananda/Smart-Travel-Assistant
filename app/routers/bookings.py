from fastapi import APIRouter, Depends, HTTPException
from typing import List
from bson import ObjectId
from .. import models, schemas

router = APIRouter(
    prefix="/bookings",
    tags=["bookings"],
)

@router.post("/", response_model=schemas.Booking)
async def create_booking(booking: schemas.BookingCreate):
    # Validate User
    user = await models.User.get(ObjectId(booking.user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Validate Place
    place = await models.Place.get(ObjectId(booking.place_id))
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
        
    # Validate Booking Type matches Place Type
    if place.place_type.value != booking.booking_type.value:
         raise HTTPException(status_code=400, detail=f"Place type {place.place_type} does not match booking type {booking.booking_type}")

    db_booking = models.Booking(**booking.dict())
    await db_booking.insert()
    
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
async def read_user_bookings(user_id: str):
    bookings = await models.Booking.find(models.Booking.user_id == ObjectId(user_id)).to_list()
    return bookings

@router.post("/{booking_id}/cancel", response_model=schemas.Booking)
async def cancel_booking(booking_id: str):
    booking = await models.Booking.get(ObjectId(booking_id))
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    booking.status = models.BookingStatus.CANCELLED
    await booking.save()
    return booking
