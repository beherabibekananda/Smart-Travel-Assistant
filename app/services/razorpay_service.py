import os
import razorpay
import hmac
import hashlib
from typing import Dict, Any
from fastapi import HTTPException

# Initialize Razorpay client
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
    print("WARNING: Razorpay credentials not found in environment variables")

razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))


class RazorpayService:
    """Service for handling Razorpay payment operations"""

    @staticmethod
    def create_order(amount: float, currency: str = "INR", receipt: str = None) -> Dict[str, Any]:
        """
        Create a Razorpay order
        
        Args:
            amount: Amount in INR (will be converted to paise)
            currency: Currency code (default: INR)
            receipt: Receipt ID for reference
            
        Returns:
            Dict containing order details
        """
        try:
            # Convert amount to paise (Razorpay uses smallest currency unit)
            amount_in_paise = int(amount * 100)
            
            order_data = {
                "amount": amount_in_paise,
                "currency": currency,
                "receipt": receipt or f"receipt_{int(amount)}",
                "payment_capture": 1  # Auto capture payment
            }
            
            order = razorpay_client.order.create(data=order_data)
            return order
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to create Razorpay order: {str(e)}")

    @staticmethod
    def verify_payment_signature(
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str
    ) -> bool:
        """
        Verify Razorpay payment signature
        
        Args:
            razorpay_order_id: Order ID from Razorpay
            razorpay_payment_id: Payment ID from Razorpay
            razorpay_signature: Signature from Razorpay
            
        Returns:
            Boolean indicating if signature is valid
        """
        try:
            # Create signature verification string
            message = f"{razorpay_order_id}|{razorpay_payment_id}"
            
            # Generate expected signature
            expected_signature = hmac.new(
                RAZORPAY_KEY_SECRET.encode(),
                message.encode(),
                hashlib.sha256
            ).hexdigest()
            
            # Compare signatures
            return hmac.compare_digest(expected_signature, razorpay_signature)
        except Exception as e:
            print(f"Signature verification error: {str(e)}")
            return False

    @staticmethod
    def fetch_payment(payment_id: str) -> Dict[str, Any]:
        """
        Fetch payment details from Razorpay
        
        Args:
            payment_id: Razorpay payment ID
            
        Returns:
            Dict containing payment details
        """
        try:
            payment = razorpay_client.payment.fetch(payment_id)
            return payment
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch payment: {str(e)}")

    @staticmethod
    def verify_webhook_signature(payload: str, signature: str, secret: str) -> bool:
        """
        Verify Razorpay webhook signature
        
        Args:
            payload: Webhook payload
            signature: Signature from Razorpay
            secret: Webhook secret
            
        Returns:
            Boolean indicating if signature is valid
        """
        try:
            expected_signature = hmac.new(
                secret.encode(),
                payload.encode(),
                hashlib.sha256
            ).hexdigest()
            
            return hmac.compare_digest(expected_signature, signature)
        except Exception as e:
            print(f"Webhook signature verification error: {str(e)}")
            return False


# Export service instance
razorpay_service = RazorpayService()
