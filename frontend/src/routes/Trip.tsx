import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { recommendRestaurants, recommendHotels, getNearbyHospitals, createBooking, type Place } from '../services/api';
import { Utensils, Hotel, Activity, MapPin, Search } from 'lucide-react';

const Trip: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'restaurants' | 'hotels' | 'hospitals'>('restaurants');
    const [userId] = useState(() => {
        const stored = localStorage.getItem('user_id');
        return stored ? parseInt(stored) : null;
    });

    const [searchParams, setSearchParams] = useState({
        current_lat: 28.6139,
        current_lon: 77.2090,
        radius_km: 5,
        planned_meal_time: 'lunch',
    });

    const restaurantMutation = useMutation({
        mutationFn: recommendRestaurants,
    });

    const hotelMutation = useMutation({
        mutationFn: recommendHotels,
    });

    const hospitalMutation = useMutation({
        mutationFn: getNearbyHospitals,
    });

    const bookingMutation = useMutation({
        mutationFn: createBooking,
        onSuccess: () => {
            alert('Booking confirmed successfully!');
        },
        onError: () => {
            alert('Failed to create booking.');
        },
    });

    const handleSearch = () => {
        if (!userId && activeTab !== 'hospitals') {
            alert('Please create a profile first!');
            return;
        }

        if (activeTab === 'restaurants') {
            restaurantMutation.mutate({
                user_id: userId!,
                current_lat: searchParams.current_lat,
                current_lon: searchParams.current_lon,
                radius_km: searchParams.radius_km,
                planned_meal_time: searchParams.planned_meal_time,
            });
        } else if (activeTab === 'hotels') {
            hotelMutation.mutate({
                user_id: userId!,
                current_lat: searchParams.current_lat,
                current_lon: searchParams.current_lon,
                radius_km: searchParams.radius_km,
            });
        } else {
            hospitalMutation.mutate({
                current_lat: searchParams.current_lat,
                current_lon: searchParams.current_lon,
                radius_km: 10, // Default for hospitals
            });
        }
    };

    const handleBook = (placeId: number, type: 'RESTAURANT' | 'HOTEL') => {
        if (!userId) return;
        bookingMutation.mutate({
            user_id: userId,
            place_id: placeId,
            booking_type: type,
        });
    };

    const renderPlaceCard = (place: Place, type: 'RESTAURANT' | 'HOTEL' | 'HOSPITAL') => (
        <div key={place.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-gray-900">{place.name}</h3>
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                    {place.rating} ★
                </span>
            </div>

            <div className="text-sm text-gray-600 space-y-1 mb-4">
                <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {place.distance_km?.toFixed(2)} km away</p>
                {type === 'RESTAURANT' && <p>Cost for two: ₹{place.avg_cost_for_two}</p>}
                {type === 'HOTEL' && <p>Price per night: ₹{place.price_per_night}</p>}
                {type === 'RESTAURANT' && place.diet_compatibility_score !== undefined && (
                    <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                            <span>Diet Match</span>
                            <span>{(place.diet_compatibility_score * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                                className={`h-1.5 rounded-full ${place.diet_compatibility_score > 0.7 ? 'bg-green-500' : place.diet_compatibility_score > 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${place.diet_compatibility_score * 100}%` }}
                            ></div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {place.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md capitalize">
                        {tag.replace('_', ' ')}
                    </span>
                ))}
            </div>

            {type !== 'HOSPITAL' && (
                <button
                    onClick={() => handleBook(place.id, type)}
                    disabled={bookingMutation.isPending}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    {bookingMutation.isPending ? 'Booking...' : 'Book Now'}
                </button>
            )}
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Search Panel */}
                <div className="w-full md:w-1/3 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Search className="w-5 h-5" /> Plan Trip
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                <input
                                    type="number"
                                    value={searchParams.current_lat}
                                    onChange={(e) => setSearchParams(p => ({ ...p, current_lat: parseFloat(e.target.value) }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                <input
                                    type="number"
                                    value={searchParams.current_lon}
                                    onChange={(e) => setSearchParams(p => ({ ...p, current_lon: parseFloat(e.target.value) }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Radius (km)</label>
                                <input
                                    type="number"
                                    value={searchParams.radius_km}
                                    onChange={(e) => setSearchParams(p => ({ ...p, radius_km: parseFloat(e.target.value) }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>
                            {activeTab === 'restaurants' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Meal Time</label>
                                    <select
                                        value={searchParams.planned_meal_time}
                                        onChange={(e) => setSearchParams(p => ({ ...p, planned_meal_time: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    >
                                        <option value="breakfast">Breakfast</option>
                                        <option value="lunch">Lunch</option>
                                        <option value="dinner">Dinner</option>
                                    </select>
                                </div>
                            )}

                            <button
                                onClick={handleSearch}
                                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors mt-2"
                            >
                                Find {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results Panel */}
                <div className="w-full md:w-2/3">
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit">
                        <button
                            onClick={() => setActiveTab('restaurants')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'restaurants' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <div className="flex items-center gap-2"><Utensils className="w-4 h-4" /> Restaurants</div>
                        </button>
                        <button
                            onClick={() => setActiveTab('hotels')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'hotels' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <div className="flex items-center gap-2"><Hotel className="w-4 h-4" /> Hotels</div>
                        </button>
                        <button
                            onClick={() => setActiveTab('hospitals')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'hospitals' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <div className="flex items-center gap-2"><Activity className="w-4 h-4" /> Hospitals</div>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {activeTab === 'restaurants' && restaurantMutation.data?.map(place => renderPlaceCard(place, 'RESTAURANT'))}
                        {activeTab === 'hotels' && hotelMutation.data?.map(place => renderPlaceCard(place, 'HOTEL'))}
                        {activeTab === 'hospitals' && hospitalMutation.data?.map(place => renderPlaceCard(place, 'HOSPITAL'))}

                        {/* Loading States */}
                        {(restaurantMutation.isPending || hotelMutation.isPending || hospitalMutation.isPending) && (
                            <div className="col-span-full text-center py-12 text-gray-500">Loading recommendations...</div>
                        )}

                        {/* Empty States */}
                        {activeTab === 'restaurants' && !restaurantMutation.isPending && !restaurantMutation.data && (
                            <div className="col-span-full text-center py-12 text-gray-400">Search for restaurants to see results</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Trip;
