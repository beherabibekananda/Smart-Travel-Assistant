import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getRestaurantRecommendations, getHotelRecommendations, getNearbyHospitals, createBooking, geocodeLocation, addFavorite, removeFavorite, getFavorites, addSearchHistory, getWeather, getPlaceReviews, createReview, markReviewHelpful, type Place, type WeatherData, type Review } from '../services/api';
import { Utensils, Hotel, Activity, MapPin, Search, Heart, Star } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';
import WeatherWidget from '../components/WeatherWidget';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';

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

    // Payment Modal State
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [selectedPlace, setSelectedPlace] = useState<{ id: number; name: string; amount: number } | null>(null);

    // Weather State
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [locationName, setLocationName] = useState<string>("Current Location");

    // Reviews State
    const [showReviewForm, setShowReviewForm] = useState<{ placeId: number; placeName: string } | null>(null);
    const [placeReviews, setPlaceReviews] = useState<Record<number, Review[]>>({});
    const [expandedReviews, setExpandedReviews] = useState<Record<number, boolean>>({});

    const restaurantMutation = useMutation({
        mutationFn: (data: { user_id: number; current_lat: number; current_lon: number; radius_km: number; planned_meal_time?: string }) =>
            getRestaurantRecommendations(data).then(res => res.data),
    });

    const hotelMutation = useMutation({
        mutationFn: (data: { user_id: number; current_lat: number; current_lon: number; radius_km: number }) =>
            getHotelRecommendations(data).then(res => res.data),
    });

    const hospitalMutation = useMutation({
        mutationFn: (data: { current_lat: number; current_lon: number; radius_km: number }) =>
            getNearbyHospitals(data).then(res => res.data),
    });

    const bookingMutation = useMutation({
        mutationFn: (data: { user_id: number; place_id: number; booking_type: string }) =>
            createBooking(data).then(res => res.data),
        onSuccess: (data) => {
            // Open payment modal after booking is created
            if (selectedPlace) {
                setPaymentModalOpen(true);
                // Update selected place with booking ID if needed, but we use the one from state
                // Actually we need the booking ID returned from createBooking to pass to PaymentModal
                // Let's update the state with the booking ID
                setSelectedPlace(prev => prev ? { ...prev, bookingId: data.id } : null);
            }
        },
        onError: () => {
            alert('Failed to create booking.');
        },
    });

    const handleCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setSearchParams(prev => ({
                        ...prev,
                        current_lat: position.coords.latitude,
                        current_lon: position.coords.longitude
                    }));
                },
                (error) => {
                    console.error("Error getting location:", error);
                    alert("Unable to retrieve your location. Please ensure location services are enabled.");
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    const handleLocationSearch = async (address: string) => {
        try {
            const res = await geocodeLocation(address);
            setSearchParams(prev => ({
                ...prev,
                current_lat: res.data.lat,
                current_lon: res.data.lon
            }));
            // Update location name for weather widget
            if (res.data.city && res.data.state) {
                setLocationName(`${res.data.city}, ${res.data.state}`);
            } else if (res.data.city) {
                setLocationName(res.data.city);
            } else if (res.data.formatted_address) {
                setLocationName(res.data.formatted_address);
            }
        } catch (error) {
            console.error("Error geocoding location:", error);
            alert("Location not found. Please try a different search term.");
        }
    };

    const { data: favorites, refetch: refetchFavorites } = useQuery({
        queryKey: ['favorites', userId],
        queryFn: () => getFavorites().then(res => res.data),
        enabled: !!userId,
    });

    const addFavoriteMutation = useMutation({
        mutationFn: addFavorite,
        onSuccess: () => refetchFavorites(),
    });

    const removeFavoriteMutation = useMutation({
        mutationFn: removeFavorite,
        onSuccess: () => refetchFavorites(),
    });

    const toggleFavorite = (placeId: number) => {
        if (!userId) return;
        const isFav = favorites?.some((f: any) => f.place_id === placeId);
        if (isFav) {
            removeFavoriteMutation.mutate(placeId);
        } else {
            addFavoriteMutation.mutate(placeId);
        }
    };

    // Fetch weather when search params change
    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const res = await getWeather(searchParams.current_lat, searchParams.current_lon);
                setWeather(res.data);
            } catch (error) {
                console.error('Error fetching weather:', error);
            }
        };
        fetchWeather();
    }, [searchParams.current_lat, searchParams.current_lon]);

    // Load reviews for a place
    const loadReviews = async (placeId: number) => {
        if (placeReviews[placeId]) {
            // Toggle expanded state if already loaded
            setExpandedReviews(prev => ({ ...prev, [placeId]: !prev[placeId] }));
            return;
        }
        try {
            const res = await getPlaceReviews(placeId);
            setPlaceReviews(prev => ({ ...prev, [placeId]: res.data }));
            setExpandedReviews(prev => ({ ...prev, [placeId]: true }));
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    };

    // Handle review submission
    const handleReviewSubmit = async (placeId: number, rating: number, comment: string) => {
        try {
            await createReview(placeId, rating, comment);
            setShowReviewForm(null);
            // Reload reviews for this place
            const res = await getPlaceReviews(placeId);
            setPlaceReviews(prev => ({ ...prev, [placeId]: res.data }));
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. You may have already reviewed this place.');
        }
    };

    // Mark review as helpful
    const handleMarkHelpful = async (reviewId: number, placeId: number) => {
        try {
            await markReviewHelpful(reviewId);
            // Reload reviews for this place
            const res = await getPlaceReviews(placeId);
            setPlaceReviews(prev => ({ ...prev, [placeId]: res.data }));
        } catch (error) {
            console.error('Error marking review helpful:', error);
        }
    };

    const handleSearch = () => {
        if (!userId && activeTab !== 'hospitals') {
            alert('Please create a profile first!');
            return;
        }

        // Save Search History
        if (userId) {
            addSearchHistory(`Search for ${activeTab}`, `${searchParams.current_lat}, ${searchParams.current_lon}`);
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

    const handleBook = (place: Place, type: 'RESTAURANT' | 'HOTEL') => {
        if (!userId) return;

        // Calculate amount based on type
        const amount = type === 'RESTAURANT'
            ? (place.avg_cost_for_two || 500)
            : (place.price_per_night || 2000);

        setSelectedPlace({
            id: place.id,
            name: place.name,
            amount: amount
        });

        bookingMutation.mutate({
            user_id: userId,
            place_id: place.id,
            booking_type: type,
        });
    };

    const renderPlaceCard = (place: Place, type: 'RESTAURANT' | 'HOTEL' | 'HOSPITAL') => {
        const isFavorite = favorites?.some((f: any) => f.place_id === place.id);

        return (
            <div key={place.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
                <button
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(place.id); }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all z-10"
                >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                </button>

                <div className="flex justify-between items-start mb-3 pr-8">
                    <h3 className="text-lg font-bold text-gray-900">{place.name}</h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                        {place.rating} ★
                    </span>
                </div>

                <div className="text-sm text-gray-600 space-y-1 mb-4">
                    {/* Location Information */}
                    {(place.city || place.state) && (
                        <p className="flex items-center gap-1 font-medium text-gray-700">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            {place.city && place.state ? `${place.city}, ${place.state}` : place.city || place.state}
                        </p>
                    )}
                    {place.formatted_address && (
                        <p className="text-xs text-gray-500 pl-5">{place.formatted_address}</p>
                    )}
                    <p className="flex items-center gap-1">
                        <span className="text-gray-500">Distance:</span> {place.distance_km?.toFixed(2)} km away
                    </p>
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

                {/* Reviews Section */}
                <div className="mt-4 border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                        <button
                            onClick={() => loadReviews(place.id)}
                            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                        >
                            <Star className="w-4 h-4" />
                            {expandedReviews[place.id] ? 'Hide Reviews' : `View Reviews (${placeReviews[place.id]?.length || 0})`}
                        </button>
                        {userId && (
                            <button
                                onClick={() => setShowReviewForm({ placeId: place.id, placeName: place.name })}
                                className="text-sm text-green-600 hover:underline"
                            >
                                Write Review
                            </button>
                        )}
                    </div>

                    {expandedReviews[place.id] && placeReviews[place.id] && (
                        <div className="space-y-3 max-h-64 overflow-y-auto mt-3">
                            {placeReviews[place.id].length > 0 ? (
                                placeReviews[place.id].slice(0, 5).map(review => (
                                    <ReviewCard
                                        key={review.id}
                                        review={review}
                                        onMarkHelpful={(id) => handleMarkHelpful(id, place.id)}
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 italic">No reviews yet. Be the first to review!</p>
                            )}
                        </div>
                    )}
                </div>

                {type !== 'HOSPITAL' && (
                    <button
                        onClick={() => handleBook(place, type)}
                        disabled={bookingMutation.isPending}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors mt-4"
                    >
                        {bookingMutation.isPending && selectedPlace?.id === place.id ? 'Processing...' : 'Book & Pay'}
                    </button>
                )}
            </div>
        );
    };

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
                            {/* Location Search */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search city..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const val = (e.target as HTMLInputElement).value;
                                                if (val) handleLocationSearch(val);
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => {
                                            const input = document.querySelector('input[placeholder="Search city..."]') as HTMLInputElement;
                                            if (input?.value) handleLocationSearch(input.value);
                                        }}
                                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                                        title="Search Location"
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={handleCurrentLocation}
                                        className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                        title="Use Current Location"
                                    >
                                        <MapPin className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                    <input
                                        type="number"
                                        value={searchParams.current_lat}
                                        onChange={(e) => setSearchParams(p => ({ ...p, current_lat: parseFloat(e.target.value) }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                    <input
                                        type="number"
                                        value={searchParams.current_lon}
                                        onChange={(e) => setSearchParams(p => ({ ...p, current_lon: parseFloat(e.target.value) }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                                        readOnly
                                    />
                                </div>
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
                    {/* Weather Widget */}
                    {weather && (
                        <WeatherWidget weather={weather} locationName={locationName} />
                    )}

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

            {/* Payment Modal */}
            {selectedPlace && (selectedPlace as any).bookingId && (
                <PaymentModal
                    isOpen={paymentModalOpen}
                    onClose={() => setPaymentModalOpen(false)}
                    bookingId={(selectedPlace as any).bookingId}
                    amount={selectedPlace.amount}
                    placeName={selectedPlace.name}
                    onSuccess={() => {
                        setPaymentModalOpen(false);
                        // Optionally refresh bookings or show success message
                    }}
                />
            )}

            {/* Review Form Modal */}
            {showReviewForm && (
                <ReviewForm
                    placeId={showReviewForm.placeId}
                    placeName={showReviewForm.placeName}
                    onSubmit={(rating, comment) => handleReviewSubmit(showReviewForm.placeId, rating, comment)}
                    onClose={() => setShowReviewForm(null)}
                />
            )}
        </div>
    );
};

export default Trip;
