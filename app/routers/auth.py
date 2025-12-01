from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime
import random
import string
from .. import models, schemas
from ..auth import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_active_user,
    ACCESS_TOKEN_EXPIRE_MINUTES
)
from ..services.email_service import email_service

router = APIRouter(
    prefix="/auth",
    tags=["authentication"],
)

def generate_otp() -> str:
    """Generate a 6-digit OTP."""
    return ''.join(random.choices(string.digits, k=6))

@router.post("/signup")
async def signup(user: schemas.UserCreate):
    """Register a new user and send OTP for email verification."""
    # Check if user already exists
    db_user = await models.User.find_one(models.User.email == user.email)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="This email is already registered. Please use a different email or try logging in."
        )
    
    # Validate password strength
    if len(user.password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters long."
        )
    
    # Validate email format (basic check)
    if "@" not in user.email or "." not in user.email:
        raise HTTPException(
            status_code=400,
            detail="Please provide a valid email address."
        )
    
    # Validate age
    if user.age < 13 or user.age > 120:
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid age between 13 and 120."
        )
    
    # Generate OTP
    otp_code = generate_otp()
    otp_expiry = datetime.utcnow() + timedelta(minutes=5)
    
    try:
        # Create new user (not verified yet)
        hashed_password = get_password_hash(user.password)
        db_user = models.User(
            email=user.email,
            hashed_password=hashed_password,
            name=user.name,
            age=user.age,
            diet_type=user.diet_type,
            daily_food_budget=user.daily_food_budget,
            hotel_budget_per_night=user.hotel_budget_per_night,
            email_verified=False,
            otp_code=otp_code,
            otp_expiry=otp_expiry
        )
        await db_user.insert()
        
        # Send OTP email
        email_service.send_otp_email(user.email, otp_code, user.name)
        
        return {
            "message": "Account created successfully. Please check your email for verification code.",
            "email": user.email
        }
    except Exception as e:
        print(f"ERROR during signup: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="An error occurred while creating your account. Please try again later."
        )

@router.post("/verify-email")
async def verify_email(email: str, otp: str):
    """Verify email with OTP code."""
    user = await models.User.find_one(models.User.email == email)
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )
    
    if user.email_verified:
        return {"message": "Email already verified. You can now login."}
    
    if not user.otp_code or not user.otp_expiry:
        raise HTTPException(
            status_code=400,
            detail="No OTP found. Please request a new one."
        )
    
    if user.otp_expiry < datetime.utcnow():
        raise HTTPException(
            status_code=400,
            detail="OTP has expired. Please request a new one."
        )
    
    if user.otp_code != otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP. Please check and try again."
        )
    
    # Mark user as verified
    user.email_verified = True
    user.otp_code = None
    user.otp_expiry = None
    await user.save()
    
    return {"message": "Email verified successfully! You can now login."}

@router.post("/resend-otp")
async def resend_otp(email: str):
    """Resend OTP to user's email."""
    user = await models.User.find_one(models.User.email == email)
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )
    
    if user.email_verified:
        raise HTTPException(
            status_code=400,
            detail="Email already verified."
        )
    
    # Generate new OTP
    otp_code = generate_otp()
    otp_expiry = datetime.utcnow() + timedelta(minutes=5)
    
    user.otp_code = otp_code
    user.otp_expiry = otp_expiry
    await user.save()
    
    # Send OTP email
    email_service.send_otp_email(user.email, otp_code, user.name)
    
    return {"message": "New OTP sent to your email."}

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login and get access token."""
    user = await models.User.find_one(models.User.email == form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please check your credentials and try again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if email is verified
    if not user.email_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before logging in. Check your inbox for the verification code.",
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.User)
async def read_users_me(current_user: models.User = Depends(get_current_active_user)):
    """Get current user information."""
    return current_user

@router.post("/forgot-password")
async def forgot_password(request: schemas.ForgotPasswordRequest):
    """
    Generate a password reset token.
    In a real app, this would send an email. Here we return it for testing.
    """
    user = await models.User.find_one(models.User.email == request.email)
    if not user:
        # Return 200 even if user not found to prevent email enumeration
        return {"message": "If the email exists, a reset token has been sent."}
    
    import uuid
    token = str(uuid.uuid4())
    user.reset_token = token
    user.reset_token_expiry = datetime.utcnow() + timedelta(minutes=30)
    await user.save()
    
    return {"message": "Password reset token generated", "reset_token": token}

@router.post("/reset-password")
async def reset_password(request: schemas.ResetPasswordRequest):
    """Reset password using a valid token."""
    user = await models.User.find_one(models.User.reset_token == request.token)
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid token")
        
    if user.reset_token_expiry < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Token expired")
        
    hashed_password = get_password_hash(request.new_password)
    user.hashed_password = hashed_password
    user.reset_token = None
    user.reset_token_expiry = None
    await user.save()
    
    return {"message": "Password updated successfully"}
