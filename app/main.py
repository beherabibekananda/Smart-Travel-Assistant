from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import users, recommendations, bookings, auth, export, payments
from .ml.diet_model import diet_model
from .seed import seed_data

# Create Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Smart Travel Assistant API"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    # Train ML Model
    diet_model.train()
    
    # Seed Data (only if database is empty)
    from .database import SessionLocal
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(recommendations.router)
app.include_router(bookings.router)
app.include_router(export.router)
app.include_router(payments.router)
