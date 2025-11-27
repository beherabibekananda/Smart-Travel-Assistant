import React from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets } from 'lucide-react';

interface WeatherData {
    current: {
        temp: number;
        feels_like: number;
        humidity: number;
        description: string;
        icon: string;
        wind_speed: number;
    };
    forecast: Array<{
        dt: number;
        temp: number;
        description: string;
        icon: string;
        date: string;
    }>;
}

interface WeatherWidgetProps {
    weather: WeatherData;
    locationName?: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather, locationName }) => {
    const getWeatherIcon = (iconCode: string) => {
        if (iconCode.startsWith('01')) return <Sun className="w-12 h-12 text-yellow-500" />;
        if (iconCode.startsWith('02') || iconCode.startsWith('03')) return <Cloud className="w-12 h-12 text-gray-400" />;
        if (iconCode.startsWith('09') || iconCode.startsWith('10')) return <CloudRain className="w-12 h-12 text-blue-500" />;
        return <Cloud className="w-12 h-12 text-gray-400" />;
    };

    return (
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg text-white p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    {locationName && <p className="text-sm opacity-90 mb-1">{locationName}</p>}
                    <h3 className="text-3xl font-bold">{Math.round(weather.current.temp)}°C</h3>
                    <p className="text-sm opacity-90 capitalize">{weather.current.description}</p>
                </div>
                <div className="text-center">
                    {getWeatherIcon(weather.current.icon)}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4" />
                    <span>{weather.current.wind_speed} m/s</span>
                </div>
                <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    <span>{weather.current.humidity}%</span>
                </div>
                <div className="text-right">
                    <span>Feels like {Math.round(weather.current.feels_like)}°C</span>
                </div>
            </div>

            {weather.forecast && weather.forecast.length > 0 && (
                <>
                    <div className="border-t border-white/20 pt-4">
                        <p className="text-xs opacity-75 mb-3">3-Day Forecast</p>
                        <div className="grid grid-cols-3 gap-3">
                            {weather.forecast.map((day, index) => (
                                <div key={index} className="text-center bg-white/10 rounded-lg p-2">
                                    <p className="text-xs opacity-75 mb-1">
                                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                    </p>
                                    <div className="flex justify-center mb-1">
                                        {getWeatherIcon(day.icon)}
                                    </div>
                                    <p className="text-sm font-semibold">{Math.round(day.temp)}°C</p>
                                    <p className="text-xs opacity-75 capitalize truncate">{day.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default WeatherWidget;
