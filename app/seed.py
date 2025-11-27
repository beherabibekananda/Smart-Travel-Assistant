from .models import Place, MenuItem, PlaceType

async def seed_data():
    """
    Populates the database with mock data if it's empty.
    """
    # Check if data already exists
    existing_places = await Place.find().limit(1).to_list()
    if existing_places:
        print("Data already exists, skipping seed.")
        return

    print("Seeding data...")

    # --- Restaurants ---
    r1 = Place(
        name="Spicy Villa",
        place_type=PlaceType.RESTAURANT,
        latitude=28.6139,
        longitude=77.2090,  # Central Delhi
        rating=4.5,
        avg_cost_for_two=800.0,
        tags=["north_indian", "spicy", "veg", "non_veg"]
    )
    await r1.insert()
    
    r2 = Place(
        name="Green Leaf",
        place_type=PlaceType.RESTAURANT,
        latitude=28.6200,
        longitude=77.2100,
        rating=4.8,
        avg_cost_for_two=1200.0,
        tags=["vegan", "healthy", "organic"]
    )
    await r2.insert()

    r3 = Place(
        name="Burger King",
        place_type=PlaceType.RESTAURANT,
        latitude=28.6100,
        longitude=77.2000,
        rating=3.9,
        avg_cost_for_two=400.0,
        tags=["fast_food", "burger", "non_veg"]
    )
    await r3.insert()

    r4 = Place(
        name="Sagar Ratna",
        place_type=PlaceType.RESTAURANT,
        latitude=28.6300,
        longitude=77.2200,
        rating=4.2,
        avg_cost_for_two=600.0,
        tags=["south_indian", "veg", "dosa"]
    )
    await r4.insert()

    # --- Menu Items ---
    # Spicy Villa
    m1 = MenuItem(restaurant_id=r1.id, item_name="Butter Chicken", description="Creamy chicken curry", tags=["non_veg", "creamy"])
    await m1.insert()
    
    m2 = MenuItem(restaurant_id=r1.id, item_name="Dal Makhani", description="Black lentils cooked overnight", tags=["veg", "creamy"])
    await m2.insert()
    
    # Green Leaf
    m3 = MenuItem(restaurant_id=r2.id, item_name="Quinoa Salad", description="Fresh quinoa with veggies", tags=["vegan", "healthy", "low_carb"])
    await m3.insert()
    
    m4 = MenuItem(restaurant_id=r2.id, item_name="Tofu Stir Fry", description="Tofu with broccoli and peppers", tags=["vegan", "protein"])
    await m4.insert()

    # Burger King
    m5 = MenuItem(restaurant_id=r3.id, item_name="Chicken Whopper", description="Grilled chicken burger", tags=["non_veg", "fast_food"])
    await m5.insert()
    
    m6 = MenuItem(restaurant_id=r3.id, item_name="Veg Whopper", description="Veggie patty burger", tags=["veg", "fast_food"])
    await m6.insert()

    # Sagar Ratna
    m7 = MenuItem(restaurant_id=r4.id, item_name="Masala Dosa", description="Rice crepe with potato filling", tags=["veg", "south_indian"])
    await m7.insert()
    
    m8 = MenuItem(restaurant_id=r4.id, item_name="Idli Sambar", description="Steamed rice cakes with lentil soup", tags=["veg", "healthy", "steamed"])
    await m8.insert()

    # --- Hotels ---
    h1 = Place(
        name="Taj Palace",
        place_type=PlaceType.HOTEL,
        latitude=28.6000,
        longitude=77.1900,
        rating=4.9,
        price_per_night=15000.0,
        tags=["luxury", "5_star", "pool"]
    )
    await h1.insert()

    h2 = Place(
        name="City Inn",
        place_type=PlaceType.HOTEL,
        latitude=28.6400,
        longitude=77.2100,
        rating=3.5,
        price_per_night=3000.0,
        tags=["budget", "clean"]
    )
    await h2.insert()

    # --- Hospitals ---
    hos1 = Place(
        name="AIIMS",
        place_type=PlaceType.HOSPITAL,
        latitude=28.5650,
        longitude=77.2090,
        rating=4.8,
        tags=["government", "multispeciality"]
    )
    await hos1.insert()

    hos2 = Place(
        name="Max Super Speciality",
        place_type=PlaceType.HOSPITAL,
        latitude=28.5500,
        longitude=77.2200,
        rating=4.6,
        tags=["private", "luxury"]
    )
    await hos2.insert()

    print("Data seeded successfully.")
