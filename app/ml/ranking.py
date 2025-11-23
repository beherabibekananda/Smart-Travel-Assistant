from ..models import User, Place, PlaceType

def score_restaurant(user: User, restaurant: Place, distance_km: float, diet_score: float) -> float:
    """
    Calculates ranking score for a restaurant.
    
    final_score = 
       0.4 * diet_compatibility_score +
       0.2 * rating_normalized +
       0.2 * (1 - distance_normalized) +
       0.2 * budget_match_score
    """
    
    # Normalize Rating (0-5 -> 0-1)
    rating_normalized = restaurant.rating / 5.0

    # Normalize Distance (Assume max relevant distance is 20km for normalization, clamp at 0)
    # If distance > 20km, distance_normalized = 1 (worst)
    max_dist = 20.0
    distance_normalized = min(distance_km / max_dist, 1.0)

    # Budget Match Score
    # 1.0 if within budget. Decays if price > budget.
    # avg_cost_for_two is for two people, so divide by 2 for per person comparison
    cost_per_person = (restaurant.avg_cost_for_two or 0) / 2.0
    if cost_per_person <= user.daily_food_budget:
        budget_match_score = 1.0
    else:
        # Decay: budget / cost (e.g. budget 100, cost 200 -> 0.5)
        if cost_per_person > 0:
            budget_match_score = user.daily_food_budget / cost_per_person
        else:
            budget_match_score = 0.0 # Should not happen if data is clean

    final_score = (
        0.4 * diet_score +
        0.2 * rating_normalized +
        0.2 * (1.0 - distance_normalized) +
        0.2 * budget_match_score
    )

    return final_score

def score_hotel(user: User, hotel: Place, distance_km: float) -> float:
    """
    Calculates ranking score for a hotel.

    final_score =
       0.3 * rating_normalized +
       0.4 * budget_match_score +
       0.3 * (1 - distance_normalized)
    """
    
    # Normalize Rating
    rating_normalized = hotel.rating / 5.0

    # Normalize Distance (Hotels can be further, say max 50km)
    max_dist = 50.0
    distance_normalized = min(distance_km / max_dist, 1.0)

    # Budget Match
    if (hotel.price_per_night or 0) <= user.hotel_budget_per_night:
        budget_match_score = 1.0
    else:
        if (hotel.price_per_night or 0) > 0:
            budget_match_score = user.hotel_budget_per_night / hotel.price_per_night
        else:
            budget_match_score = 0.0

    final_score = (
        0.3 * rating_normalized +
        0.4 * budget_match_score +
        0.3 * (1.0 - distance_normalized)
    )

    return final_score
