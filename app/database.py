from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from dotenv import load_dotenv
import certifi

load_dotenv()

# MongoDB settings
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
print(f"DEBUG: MONGODB_URL loaded: {MONGODB_URL[:25]}... (Is localhost: {'localhost' in MONGODB_URL})")
DATABASE_NAME = "smart_travel"

# MongoDB client
client: AsyncIOMotorClient = None

async def connect_to_mongo():
    """Connect to MongoDB Atlas"""
    global client
    try:
        # Debug SSL environment
        import ssl
        import sys
        print(f"DEBUG: Python {sys.version}")
        print(f"DEBUG: SSL {ssl.OPENSSL_VERSION}")
        
        # Simplified SSL config: rely on system CA, but allow invalid certs for now
        # Removed certifi to avoid potential conflicts
        client = AsyncIOMotorClient(MONGODB_URL, tls=True, tlsAllowInvalidCertificates=True)
        
        # Import all document models
        from app.models import User, Place, MenuItem, Booking, Transaction, SearchHistory, Favorite, Review
        
        # Initialize beanie with the database and models
        await init_beanie(
            database=client[DATABASE_NAME],
            document_models=[
                User,
                Place,
                MenuItem,
                Booking,
                Transaction,
                SearchHistory,
                Favorite,
                Review
            ]
        )
        print(f"Connected to MongoDB Atlas: {DATABASE_NAME}")
    except Exception as e:
        print(f"ERROR: Failed to connect to MongoDB: {e}")
        # Print more details if available
        import traceback
        traceback.print_exc()
        raise e

async def close_mongo_connection():
    """Close MongoDB connection"""
    global client
    if client:
        client.close()
        print("Closed MongoDB connection")

def get_database():
    """Get database instance"""
    return client[DATABASE_NAME]
