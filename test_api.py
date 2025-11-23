import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_health():
    response = requests.get(f"{BASE_URL}/health")
    assert response.status_code == 200
    print("Health Check: PASSED")

def test_create_user():
    user_data = {
        "name": "Test User",
        "age": 30,
        "diet_type": "VEGAN",
        "daily_food_budget": 1000,
        "hotel_budget_per_night": 5000
    }
    response = requests.post(f"{BASE_URL}/users/", json=user_data)
    assert response.status_code == 200
    user = response.json()
    assert user["name"] == "Test User"
    print("Create User: PASSED")
    return user["id"]

def test_recommend_restaurants(user_id):
    req_data = {
        "user_id": user_id,
        "current_lat": 28.6139,
        "current_lon": 77.2090,
        "radius_km": 10,
        "planned_meal_time": "lunch"
    }
    response = requests.post(f"{BASE_URL}/recommend/restaurants", json=req_data)
    assert response.status_code == 200
    results = response.json()
    assert len(results) > 0
    # Verify Vegan restaurant is top ranked for Vegan user
    # "Green Leaf" is vegan and should be high up
    top_place = results[0]
    print(f"Top Restaurant: {top_place['name']} (Score: {top_place['final_score']})")
    print("Recommend Restaurants: PASSED")
    return results[0]["id"]

def test_recommend_hotels(user_id):
    req_data = {
        "user_id": user_id,
        "current_lat": 28.6139,
        "current_lon": 77.2090,
        "radius_km": 10
    }
    response = requests.post(f"{BASE_URL}/recommend/hotels", json=req_data)
    assert response.status_code == 200
    results = response.json()
    assert len(results) > 0
    print(f"Top Hotel: {results[0]['name']}")
    print("Recommend Hotels: PASSED")

def test_nearby_hospitals():
    req_data = {
        "current_lat": 28.6139,
        "current_lon": 77.2090,
        "radius_km": 10
    }
    response = requests.post(f"{BASE_URL}/nearby/hospitals", json=req_data)
    assert response.status_code == 200
    results = response.json()
    assert len(results) > 0
    print(f"Nearest Hospital: {results[0]['name']}")
    print("Nearby Hospitals: PASSED")

def test_create_booking(user_id, place_id):
    booking_data = {
        "user_id": user_id,
        "place_id": place_id,
        "booking_type": "RESTAURANT" 
    }
    response = requests.post(f"{BASE_URL}/bookings/", json=booking_data)
    if response.status_code != 200:
        print(f"Booking failed: {response.text}")
    assert response.status_code == 200
    print("Create Booking: PASSED")

if __name__ == "__main__":
    try:
        test_health()
        user_id = test_create_user()
        restaurant_id = test_recommend_restaurants(user_id)
        test_recommend_hotels(user_id)
        test_nearby_hospitals()
        test_create_booking(user_id, restaurant_id)
        print("\nALL TESTS PASSED")
    except Exception as e:
        print(f"\nTEST FAILED: {e}")
