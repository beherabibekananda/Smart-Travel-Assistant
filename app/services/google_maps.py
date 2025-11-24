import requests
import os
from sqlalchemy.orm import Session
from .. import models
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

class GoogleMapsService:
    def __init__(self):
        self.api_key = GOOGLE_API_KEY
        # Using the new Places API (New)
        self.base_url = "https://places.googleapis.com/v1/places:searchNearby"

    def search_nearby(self, lat: float, lon: float, radius_km: float, place_type: str) -> list:
        """
        Fetches nearby places from Google Maps Places API (New).
        place_type: 'restaurant', 'lodging' (for hotel), 'hospital'
        """
        if not self.api_key:
            print("Warning: GOOGLE_API_KEY not set.")
            return []

        # Map our types to the new API types
        type_mapping = {
            "restaurant": "restaurant",
            "lodging": "lodging",
            "hospital": "hospital"
        }
        
        included_type = type_mapping.get(place_type, place_type)

        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.types,places.id"
        }

        body = {
            "includedTypes": [included_type],
            "maxResultCount": 20,
            "locationRestriction": {
                "circle": {
                    "center": {
                        "latitude": lat,
                        "longitude": lon
                    },
                    "radius": radius_km * 1000  # Convert to meters
                }
            }
        }

        print(f"[Google Maps] Calling new Places API for type: {included_type}")
        
        try:
            response = requests.post(self.base_url, json=body, headers=headers)
            response.raise_for_status()
            data = response.json()
            results = data.get("places", [])
            print(f"[Google Maps] Got {len(results)} results from new API")
            return results
        except Exception as e:
            print(f"Error fetching from Google Maps: {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response: {e.response.text}")
            return []

    def convert_to_db_model(self, google_place: dict, place_type_enum: models.PlaceType) -> models.Place:
        """
        Converts a Google Place result (new API format) to our DB model.
        """
        # Extract types
        types = google_place.get("types", [])
        tags = [t.replace("_", " ") for t in types if t not in ["point_of_interest", "establishment"]]
        
        # Get price level (PRICE_LEVEL_UNSPECIFIED, PRICE_LEVEL_FREE, PRICE_LEVEL_INEXPENSIVE, 
        # PRICE_LEVEL_MODERATE, PRICE_LEVEL_EXPENSIVE, PRICE_LEVEL_VERY_EXPENSIVE)
        price_level_map = {
            "PRICE_LEVEL_FREE": 0,
            "PRICE_LEVEL_INEXPENSIVE": 1,
            "PRICE_LEVEL_MODERATE": 2,
            "PRICE_LEVEL_EXPENSIVE": 3,
            "PRICE_LEVEL_VERY_EXPENSIVE": 4
        }
        
        price_level_str = google_place.get("priceLevel", "PRICE_LEVEL_MODERATE")
        price_level = price_level_map.get(price_level_str, 2)
        
        avg_cost = None
        price_per_night = None
        
        if place_type_enum == models.PlaceType.RESTAURANT:
            avg_cost = [200, 500, 1000, 2000, 3000][min(price_level, 4)]
        elif place_type_enum == models.PlaceType.HOTEL:
            price_per_night = [1000, 3000, 5000, 10000, 20000][min(price_level, 4)]

        # Extract location
        location = google_place.get("location", {})
        
        return models.Place(
            google_place_id=google_place.get("id"),
            name=google_place.get("displayName", {}).get("text", "Unknown"),
            place_type=place_type_enum,
            latitude=location.get("latitude", 0.0),
            longitude=location.get("longitude", 0.0),
            rating=google_place.get("rating", 0.0),
            avg_cost_for_two=avg_cost,
            price_per_night=price_per_night,
            tags=tags
        )

    def sync_places(self, db: Session, google_results: list, place_type_enum: models.PlaceType) -> list:
        """
        Syncs Google results with the database. Returns a list of DB Place objects.
        """
        synced_places = []
        for g_place in google_results:
            place_id = g_place.get("id")
            
            if not place_id:
                continue
            
            # Check if exists
            db_place = db.query(models.Place).filter(models.Place.google_place_id == place_id).first()
            
            if not db_place:
                # Create new
                db_place = self.convert_to_db_model(g_place, place_type_enum)
                db.add(db_place)
                db.commit()
                db.refresh(db_place)
            
            synced_places.append(db_place)
            
        return synced_places

    def geocode(self, address: str) -> dict:
        """
        Geocodes an address to lat/lon using Google Maps Geocoding API.
        """
        if not self.api_key:
            print("Warning: GOOGLE_API_KEY not set.")
            return None

        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {
            "address": address,
            "key": self.api_key
        }

        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            if data["status"] == "OK" and data["results"]:
                location = data["results"][0]["geometry"]["location"]
                return {"lat": location["lat"], "lon": location["lng"]}
            else:
                print(f"[Google Maps] Geocoding failed: {data.get('status')}")
                return None
        except Exception as e:
            print(f"Error geocoding address: {e}")
            return None

google_maps_service = GoogleMapsService()
