from fastapi import APIRouter, Depends, HTTPException, Header, Request
from typing import Optional
from bson import ObjectId
from .. import models, schemas
from ..auth import get_current_active_user
from ..services.razorpay_service import razorpay_service, RAZORPAY_KEY_ID
import os

router = APIRouter(
    prefix="/payments",
    tags=["payments"]
)


@router.post("/create-order", response_model=schemas.PaymentOrderResponse)
async def create_payment_order(
    payment_data: schemas.PaymentOrderCreate,
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Create a Razorpay payment order for a booking
    """
    # Verify booking exists and belongs to current user
    booking = await models.Booking.find_one(
        models.Booking.id == ObjectId(payment_data.booking_id),
        models.Booking.user_id == current_user.id
    )
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Check if transaction already exists
    existing_transaction = await models.Transaction.find_one(
        models.Transaction.booking_id == ObjectId(payment_data.booking_id)
    )
    
    if existing_transaction:
        raise HTTPException(status_code=400, detail="Payment already initiated for this booking")
    
    # Create Razorpay order
    order = razorpay_service.create_order(
        amount=payment_data.amount,
        receipt=f"booking_{payment_data.booking_id}"
    )
    
    # Create transaction record
    transaction = models.Transaction(
        booking_id=ObjectId(payment_data.booking_id),
        razorpay_order_id=order["id"],
        amount=payment_data.amount,
        currency=order["currency"],
        status=models.PaymentStatus.CREATED
    )
    
    await transaction.insert()
    
    return {
        "order_id": order["id"],
        "amount": payment_data.amount,
        "currency": order["currency"],
        "razorpay_key_id": RAZORPAY_KEY_ID
    }


@router.post("/verify")
async def verify_payment(
    payment_verify: schemas.PaymentVerify,
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Verify Razorpay payment signature and update transaction status
    """
    # Get transaction
    transaction = await models.Transaction.find_one(
        models.Transaction.razorpay_order_id == payment_verify.razorpay_order_id
    )
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Verify booking belongs to current user
    booking = await models.Booking.find_one(
        models.Booking.id == transaction.booking_id,
        models.Booking.user_id == current_user.id
    )
    
    if not booking:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    # Verify payment signature
    is_valid = razorpay_service.verify_payment_signature(
        razorpay_order_id=payment_verify.razorpay_order_id,
        razorpay_payment_id=payment_verify.razorpay_payment_id,
        razorpay_signature=payment_verify.razorpay_signature
    )
    
    if not is_valid:
        transaction.status = models.PaymentStatus.FAILED
        await transaction.save()
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    
    # Update transaction
    transaction.razorpay_payment_id = payment_verify.razorpay_payment_id
    transaction.razorpay_signature = payment_verify.razorpay_signature
    transaction.status = models.PaymentStatus.CAPTURED
    
    # Update booking status
    booking.status = models.BookingStatus.CONFIRMED
    
    await transaction.save()
    await booking.save()
    
    return {
        "success": True,
        "message": "Payment verified successfully",
        "transaction_id": str(transaction.id)
    }


@router.get("/transaction/{booking_id}", response_model=schemas.TransactionResponse)
async def get_transaction(
    booking_id: str,
    current_user: models.User = Depends(get_current_active_user)
):
    """
    Get transaction details for a booking
    """
    # Verify booking belongs to current user
    booking = await models.Booking.find_one(
        models.Booking.id == ObjectId(booking_id),
        models.Booking.user_id == current_user.id
    )
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    transaction = await models.Transaction.find_one(
        models.Transaction.booking_id == ObjectId(booking_id)
    )
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return transaction


@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None)
):
    """
    Handle Razorpay webhook events
    """
    # Get webhook secret from environment
    webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")
    
    if not webhook_secret:
        raise HTTPException(status_code=500, detail="Webhook secret not configured")
    
    # Get request body
    body = await request.body()
    payload = body.decode("utf-8")
    
    # Verify webhook signature
    if not x_razorpay_signature:
        raise HTTPException(status_code=400, detail="Missing signature header")
    
    is_valid = razorpay_service.verify_webhook_signature(
        payload=payload,
        signature=x_razorpay_signature,
        secret=webhook_secret
    )
    
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
    
    # Process webhook event
    # You can add event-specific logic here
    
    return {"status": "success"}
