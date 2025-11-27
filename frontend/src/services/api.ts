import axios from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface User {
    id: number;
    email: string;
    name: string;
    age: number;
    diet_type: string;
    daily_food_budget: number;
    hotel_budget_per_night: number;
    is_active: boolean;
    created_at: string;
    avatar_url?: string;
}

export interface Place {
    id: number;
    name: string;
    place_type: string;
    latitude: number;
    longitude: number;
    rating: number;
    avg_cost_for_two?: number;
    price_per_night?: number;
    tags: string[];
    diet_compatibility_score?: number;
    final_score?: number;
    distance_km?: number;
    city?: string;
    state?: string;
    formatted_address?: string;
}

export interface Booking {
    id: number;
    user_id: number;
    place_id: number;
    booking_type: string;
    status: string;
    timestamp: string;
}

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const getUser = (userId: number) => api.get<User>(`/users/${userId}`);
export const createUser = (userData: Partial<User>) => api.post<User>('/users/', userData);

export const getRestaurantRecommendations = (data: {
    user_id: number;
    current_lat: number;
    current_lon: number;
    radius_km: number;
    planned_meal_time?: string;
}) => api.post<Place[]>('/recommend/restaurants', data);

export const getHotelRecommendations = (data: {
    user_id: number;
    current_lat: number;
    current_lon: number;
    radius_km: number;
}) => api.post<Place[]>('/recommend/hotels', data);

export const getNearbyHospitals = (data: {
    current_lat: number;
    current_lon: number;
    radius_km: number;
}) => api.post<Place[]>('/nearby/hospitals', data);

export const createBooking = (bookingData: {
    user_id: number;
    place_id: number;
    booking_type: string;
}) => api.post<Booking>('/bookings/', bookingData);

export const getUserBookings = (userId: number) => api.get<Booking[]>(`/bookings/user/${userId}`);

export const geocodeLocation = (address: string) => api.get<{ lat: number; lon: number; city?: string; state?: string; formatted_address?: string }>('/recommend/geocode', { params: { address } });

export const forgotPassword = (email: string) => api.post<{ message: string; reset_token?: string }>('/auth/forgot-password', { email });

export const resetPassword = (data: { token: string; new_password: string }) => api.post<{ message: string }>('/auth/reset-password', data);

// UX Improvements
export const updateProfile = (data: Partial<User>) => api.put<User>('/users/me', data);

export const cancelBooking = (bookingId: number) => api.post<Booking>(`/bookings/${bookingId}/cancel`);

export const addFavorite = (placeId: number) => api.post<Place>(`/users/favorites/${placeId}`);
export const removeFavorite = (placeId: number) => api.delete(`/users/favorites/${placeId}`);
export const getFavorites = () => api.get<{ id: number; place_id: number; place: Place }[]>('/users/favorites');

export const addSearchHistory = (query: string, location: string) => api.post('/users/history', { query, location });
export const getSearchHistory = () => api.get<{ id: number; query: string; location: string; timestamp: string }[]>('/users/history');

// Reviews
export interface Review {
    id: number;
    user_id: number;
    place_id: number;
    rating: number;
    comment: string;
    helpful_count: number;
    timestamp: string;
    user?: {
        name: string;
        avatar_url?: string;
    };
}

export const createReview = (placeId: number, rating: number, comment: string) =>
    api.post<Review>('/reviews/', { place_id: placeId, rating, comment });

export const getPlaceReviews = (placeId: number) =>
    api.get<Review[]>(`/reviews/place/${placeId}`);

export const getUserReviews = () =>
    api.get<Review[]>('/reviews/user');

export const updateReview = (reviewId: number, rating?: number, comment?: string) =>
    api.put<Review>(`/reviews/${reviewId}`, { rating, comment });

export const deleteReview = (reviewId: number) =>
    api.delete(`/reviews/${reviewId}`);

export const markReviewHelpful = (reviewId: number) =>
    api.post(`/reviews/${reviewId}/helpful`);

// Weather
export interface WeatherData {
    current: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
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

export const getWeather = (lat: number, lon: number) =>
    api.get<WeatherData>('/weather', { params: { lat, lon } });


export default api;
