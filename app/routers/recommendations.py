from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas
from ..database import get_db
from ..utils import haversine_distance
from ..ml.diet_model import diet_model
from ..ml.ranking import score_restaurant, score_hotel
from ..services.google_maps import google_maps_service

router = APIRouter(
    tags=["recommendations"],
)

@router.post("/recommend/restaurants", response_model=List[schemas.Place])
def recommend_restaurants(request: schemas.RestaurantRecommendationRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 1. Fetch from Google Maps
    google_results = google_maps_service.search_nearby(
        request.current_lat, 
        request.current_lon, 
        request.radius_km, 
        "restaurant"
    )
    
    # 2. Sync to DB
    restaurants = google_maps_service.sync_places(db, google_results, models.PlaceType.RESTAURANT)
    
    # If Google fails or returns nothing, fallback to existing DB data (mock data)
    if not restaurants:
        restaurants = db.query(models.Place).filter(models.Place.place_type == models.PlaceType.RESTAURANT).all()

    scored_restaurants = []
    
    for r in restaurants:
        # Calculate distance
        dist = haversine_distance(request.current_lat, request.current_lon, r.latitude, r.longitude)
        
        if dist > request.radius_km:
            continue
            
        # Calculate Diet Compatibility Score
        # Since we might not have menu items for Google places, we use tags/name
        # Construct a "virtual" menu text from tags and name
        menu_text = f"{r.name} {' '.join(r.tags or [])}"
        
        # If we have real menu items (from seed data), include them
        if r.menu_items:
            for item in r.menu_items:
                menu_text += f" {item.item_name} {item.description}"
        
        diet_score = diet_model.predict(user.diet_type.value, menu_text)

        # Calculate Final Score
        final_score = score_restaurant(user, r, dist, diet_score)
        
        # Attach scores
        r.distance_km = dist
        r.diet_compatibility_score = diet_score
        r.final_score = final_score
        
        scored_restaurants.append(r)
        
    scored_restaurants.sort(key=lambda x: x.final_score, reverse=True)
    
    return scored_restaurants[:10]

@router.post("/recommend/hotels", response_model=List[schemas.Place])
def recommend_hotels(request: schemas.HotelRecommendationRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == request.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # 1. Fetch from Google Maps
    google_results = google_maps_service.search_nearby(
        request.current_lat, 
        request.current_lon, 
        request.radius_km, 
        "lodging"
    )
    
    # 2. Sync to DB
    hotels = google_maps_service.sync_places(db, google_results, models.PlaceType.HOTEL)
    
    if not hotels:
        hotels = db.query(models.Place).filter(models.Place.place_type == models.PlaceType.HOTEL).all()
    
    scored_hotels = []
    
    for h in hotels:
        dist = haversine_distance(request.current_lat, request.current_lon, h.latitude, h.longitude)
        
        if dist > request.radius_km:
            continue
            
        final_score = score_hotel(user, h, dist)
        
        h.distance_km = dist
        h.final_score = final_score
        
        scored_hotels.append(h)
        
    scored_hotels.sort(key=lambda x: x.final_score, reverse=True)
    
    return scored_hotels[:10]

@router.post("/nearby/hospitals", response_model=List[schemas.Place])
def nearby_hospitals(request: schemas.HospitalRecommendationRequest, db: Session = Depends(get_db)):
    # 1. Fetch from Google Maps
    google_results = google_maps_service.search_nearby(
        request.current_lat, 
        request.current_lon, 
        request.radius_km, 
        "hospital"
    )
    
    # 2. Sync to DB
    hospitals = google_maps_service.sync_places(db, google_results, models.PlaceType.HOSPITAL)
    
    if not hospitals:
        hospitals = db.query(models.Place).filter(models.Place.place_type == models.PlaceType.HOSPITAL).all()
    
    nearby = []
    for h in hospitals:
        dist = haversine_distance(request.current_lat, request.current_lon, h.latitude, h.longitude)
        
        if dist > request.radius_km:
            continue
            
        h.distance_km = dist
        nearby.append(h)
        
    nearby.sort(key=lambda x: (x.distance_km, -x.rating))
    
    return nearby[:5]

@router.get("/geocode")
def geocode_address(address: str):
    location = google_maps_service.geocode(address)
    if not location:
        raise HTTPException(status_code=404, detail="Address not found")
    return location
