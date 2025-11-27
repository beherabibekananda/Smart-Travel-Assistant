from fastapi import APIRouter, Query
from ..services.weather_service import WeatherService

router = APIRouter(
    prefix="/weather",
    tags=["weather"],
)

@router.get("/")
async def get_weather(
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """
    Get current weather and 3-day forecast for given coordinates.
    
    Returns current conditions and forecast data.
    """
    weather_data = await WeatherService.get_weather(lat, lon)
    return weather_data
