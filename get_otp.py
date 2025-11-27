#!/usr/bin/env python3
from pymongo import MongoClient

MONGODB_URL = "mongodb+srv://beherabibekananda778_db_user:Bibek%401920@cluster0.mxobkdj.mongodb.net/smart_travel?retryWrites=true&w=majority&appName=Cluster0"

client = MongoClient(MONGODB_URL)
db = client["smart_travel"]

user = db.users.find_one({"email": "beherabibekananda778@gmail.com"})

if user and user.get("otp_code"):
    print(f"\n{'='*60}")
    print(f"   YOUR OTP CODE: {user.get('otp_code')}")
    print(f"{'='*60}\n")
else:
    print("\n⚠️  No active OTP. Run: curl -X POST 'http://localhost:8000/auth/resend-otp?email=beherabibekananda778@gmail.com'\n")

client.close()
