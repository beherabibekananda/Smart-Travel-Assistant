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

export default api;
