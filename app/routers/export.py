from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from openpyxl import Workbook
from io import BytesIO
from datetime import datetime
from .. import models
from ..database import get_db
from ..auth import get_current_active_user

router = APIRouter(
    prefix="/export",
    tags=["export"],
)

@router.get("/users")
def export_users(
    db: Session = Depends(get_db),
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
    users = db.query(models.User).all()
    for user in users:
        ws.append([
            user.id,
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
def export_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    """Export all bookings to Excel file."""
    # Create workbook
    wb = Workbook()
    ws = wb.active
    ws.title = "Bookings"
    
    # Headers
    headers = ["ID", "User Email", "Place Name", "Booking Type", "Status", "Timestamp"]
    ws.append(headers)
    
    # Data
    bookings = db.query(models.Booking).join(models.User).join(models.Place).all()
    for booking in bookings:
        ws.append([
            booking.id,
            booking.user.email,
            booking.place.name,
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
