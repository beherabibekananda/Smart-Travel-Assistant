import os
import aiohttp
from typing import Dict, Optional

class WeatherService:
    """Service to fetch weather data from OpenWeatherMap API."""
    
    BASE_URL = "https://api.openweathermap.org/data/2.5"
    API_KEY = os.getenv("OPENWEATHER_API_KEY", "demo_key")  # Use demo for now
    
    @staticmethod
    async def get_weather(lat: float, lon: float) -> Dict:
        """
        Get current weather and 5-day forecast for coordinates.
        
        Args:
            lat: Latitude
            lon: Longitude
            
        Returns:
            Dictionary with current weather and forecast data
        """
        # If no API key, return mock data
        if WeatherService.API_KEY == "demo_key":
            return WeatherService._get_mock_weather(lat, lon)
        
        try:
            async with aiohttp.ClientSession() as session:
                # Get current weather
                current_url = f"{WeatherService.BASE_URL}/weather"
                current_params = {
                    "lat": lat,
                    "lon": lon,
                    "appid": WeatherService.API_KEY,
                    "units": "metric"  # Celsius
                }
                
                async with session.get(current_url, params=current_params) as response:
                    if response.status != 200:
                        return WeatherService._get_mock_weather(lat, lon)
                    current_data = await response.json()
                
                # Get 5-day forecast
                forecast_url = f"{WeatherService.BASE_URL}/forecast"
                forecast_params = {
                    "lat": lat,
                    "lon": lon,
                    "appid": WeatherService.API_KEY,
                    "units": "metric",
                    "cnt": 24  # 3-day forecast (8 data points per day)
                }
                
                async with session.get(forecast_url, params=forecast_params) as response:
                    if response.status != 200:
                        forecast_data = {"list": []}
                    else:
                        forecast_data = await response.json()
                
                return {
                    "current": {
                        "temp": current_data["main"]["temp"],
                        "feels_like": current_data["main"]["feels_like"],
                        "temp_min": current_data["main"]["temp_min"],
                        "temp_max": current_data["main"]["temp_max"],
                        "pressure": current_data["main"]["pressure"],
                        "humidity": current_data["main"]["humidity"],
                        "description": current_data["weather"][0]["description"],
                        "icon": current_data["weather"][0]["icon"],
                        "wind_speed": current_data.get("wind", {}).get("speed", 0),
                    },
                    "forecast": [
                        {
                            "dt": item["dt"],
                            "temp": item["main"]["temp"],
                            "description": item["weather"][0]["description"],
                            "icon": item["weather"][0]["icon"],
                            "date": item["dt_txt"]
                        }
                        for item in forecast_data.get("list", [])[:24:8]  # Every 8th item for daily forecast
                    ]
                }
        except Exception as e:
            print(f"Error fetching weather: {e}")
            return WeatherService._get_mock_weather(lat, lon)
    
    @staticmethod
    def _get_mock_weather(lat: float, lon: float) -> Dict:
        """Return mock weather data for development."""
        from datetime import datetime, timedelta
        
        # Get current date and future dates
        now = datetime.now()
        tomorrow = now + timedelta(days=1)
        day_after = now + timedelta(days=2)
        third_day = now + timedelta(days=3)
        
        return {
            "current": {
                "temp": 28,
                "feels_like": 30,
                "temp_min": 25,
                "temp_max": 32,
                "pressure": 1013,
                "humidity": 65,
                "description": "partly cloudy",
                "icon": "02d",
                "wind_speed": 3.5,
            },
            "forecast": [
                {
                    "dt": int(tomorrow.timestamp()),
                    "temp": 29,
                    "description": "sunny",
                    "icon": "01d",
                    "date": tomorrow.strftime("%Y-%m-%d %H:%M:%S")
                },
                {
                    "dt": int(day_after.timestamp()),
                    "temp": 27,
                    "description": "light rain",
                    "icon": "10d",
                    "date": day_after.strftime("%Y-%m-%d %H:%M:%S")
                },
                {
                    "dt": int(third_day.timestamp()),
                    "temp": 26,
                    "description": "cloudy",
                    "icon": "03d",
                    "date": third_day.strftime("%Y-%m-%d %H:%M:%S")
                }
            ]
        }
