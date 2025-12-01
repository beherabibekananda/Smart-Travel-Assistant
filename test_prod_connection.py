import requests
import time
import sys

URL = "https://smart-travel-backend.onrender.com/health"
MAX_RETRIES = 10
DELAY = 5

print(f"Testing connection to: {URL}")
print("Note: Render free tier services may take up to a minute to wake up.")

for i in range(MAX_RETRIES):
    try:
        print(f"Attempt {i+1}/{MAX_RETRIES}...")
        response = requests.get(URL, timeout=10)
        if response.status_code == 200:
            print(f"✅ Success! Connected to backend. Status: {response.status_code}")
            print(f"Response: {response.json()}")
            sys.exit(0)
        else:
            print(f"⚠️  Connected, but received status {response.status_code}")
            print(f"Response: {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection failed: {e}")
    
    if i < MAX_RETRIES - 1:
        print(f"Retrying in {DELAY} seconds...")
        time.sleep(DELAY)

print("❌ Failed to connect after multiple attempts.")
sys.exit(1)
