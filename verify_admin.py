#!/usr/bin/env python3
"""Quick script to verify admin account"""
from pymongo import MongoClient
import sys

MONGODB_URL = "mongodb+srv://beherabibekananda778_db_user:Bibek%401920@cluster0.mxobkdj.mongodb.net/smart_travel?retryWrites=true&w=majority&appName=Cluster0"

try:
    client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=5000)
    db = client["smart_travel"]
    
    # Verify admin account
    result = db.users.update_one(
        {"email": "beherabibekananda778@gmail.com"},
        {"$set": {"email_verified": True, "otp_code": None, "otp_expiry": None}}
    )
    
    if result.matched_count > 0:
        print("\n✅ Admin account verified!")
        print("📧 Email: beherabibekananda778@gmail.com")
        print("\n🔓 You can now login at: http://localhost:5173/login\n")
    else:
        print("\n❌ Account not found. Please sign up first.\n")
    
    client.close()
except Exception as e:
    print(f"\n❌ Error: {e}\n")
    sys.exit(1)
