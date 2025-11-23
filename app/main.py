from fastapi import FastAPI
from .database import engine, Base, SessionLocal
from .routers import users, recommendations, bookings
from .ml.diet_model import diet_model
from .seed import seed_data

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Travel Assistant",
    description="AI-powered backend for travel recommendations based on diet, budget, and location.",
    version="1.0.0"
)

@app.on_event("startup")
def startup_event():
    # Train ML Model
    print("Training Diet Compatibility Model...")
    diet_model.train()
    
    # Seed Data
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(users.router)
app.include_router(recommendations.router)
app.include_router(bookings.router)
