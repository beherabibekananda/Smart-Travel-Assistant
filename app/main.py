from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import connect_to_mongo, close_mongo_connection
from .routers import users, recommendations, bookings, auth, export, payments, reviews, weather
from .ml.diet_model import diet_model

app = FastAPI(
    title="Smart Travel Assistant API"
)

# CORS middleware
from fastapi import Request
from fastapi.responses import JSONResponse
import traceback

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",  # Allow all origins with credentials
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Global Exception: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error. Check server logs for details."},
    )

@app.on_event("startup")
async def startup_event():
    # Connect to MongoDB
    await connect_to_mongo()
    
    # Train ML Model
    diet_model.train()
    
    # Seed Data (only if database is empty)
    from .seed import seed_data
    await seed_data()

@app.on_event("shutdown")
async def shutdown_event():
    # Close MongoDB connection
    await close_mongo_connection()

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(recommendations.router)
app.include_router(bookings.router)
app.include_router(export.router)
app.include_router(payments.router)
app.include_router(reviews.router)
app.include_router(weather.router)

@app.post("/debug/reset-db")
async def reset_database():
    """Drop all collections and recreate with seed data"""
    from .models import User, Place, MenuItem, Booking, Transaction, SearchHistory, Favorite, Review
    from .seed import seed_data
    
    # Delete all documents from collections
    await User.delete_all()
    await Place.delete_all()
    await MenuItem.delete_all()
    await Booking.delete_all()
    await Transaction.delete_all()
    await SearchHistory.delete_all()
    await Favorite.delete_all()
    await Review.delete_all()
    
    # Reseed data
    await seed_data()
    
    return {"message": "Database reset successfully. All collections cleared and reseeded."}
