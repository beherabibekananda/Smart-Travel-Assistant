from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from io import BytesIO
from datetime import datetime
from bson import ObjectId
from .. import models
from ..auth import get_current_active_user

router = APIRouter(
    prefix="/export",
    tags=["export"],
)

@router.get("/users")
async def export_users(
    current_user: models.User = Depends(get_current_active_user)
):
    """Export all users to Excel file."""
    # Create workbook
    wb = Workbook()
    ws = wb.active
    ws.title = "Users"
    
    # Headers
    headers = ["ID", "Email", "Name", "Age", "Diet Type", "Food Budget", "Hotel Budget", "Created At"]
    ws.append(headers)
    
    # Data
    users = await models.User.find().to_list()
    for user in users:
        ws.append([
            str(user.id),
            user.email,
            user.name,
            user.age,
            user.diet_type.value if user.diet_type else "",
            user.daily_food_budget,
            user.hotel_budget_per_night,
            user.created_at.strftime("%Y-%m-%d %H:%M:%S") if user.created_at else ""
        ])
    
    # Save to BytesIO
    output = BytesIO()
    wb.save(output)
    output.seek(0)
    
    # Return as downloadable file
    filename = f"users_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/bookings")
async def export_bookings(
    current_user: models.User = Depends(get_current_active_user)
):
    """Export all bookings to Excel file."""
    # Create workbook
    wb = Workbook()
    ws = wb.active
    ws.title = "Bookings"
    
    # Headers
    headers = ["ID", "User ID", "Place ID", "Booking Type", "Status", "Timestamp"]
    ws.append(headers)
    
    # Data
    bookings = await models.Booking.find().to_list()
    for booking in bookings:
        # Get user and place info
        user = await models.User.get(booking.user_id)
        place = await models.Place.get(booking.place_id)
        
        ws.append([
            str(booking.id),
            user.email if user else str(booking.user_id),
            place.name if place else str(booking.place_id),
            booking.booking_type.value,
            booking.status.value,
            booking.timestamp.strftime("%Y-%m-%d %H:%M:%S")
        ])
    
    # Save to BytesIO
    output = BytesIO()
    wb.save(output)
    output.seek(0)
    
    # Return as downloadable file
    filename = f"bookings_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
