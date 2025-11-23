import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface User {
    id: number;
    name: string;
    age: number;
    diet_type: string;
    daily_food_budget: number;
    hotel_budget_per_night: number;
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
    timestamp: string;
    status: string;
    place?: Place; // Optional if backend returns nested place
}

export const createUser = async (data: Omit<User, 'id'>) => {
    const response = await api.post<User>('/users/', data);
    return response.data;
};

export const getUser = async (userId: number) => {
    const response = await api.get<User>(`/users/${userId}`);
    return response.data;
};

export const recommendRestaurants = async (data: {
    user_id: number;
    current_lat: number;
    current_lon: number;
    radius_km: number;
    planned_meal_time?: string;
}) => {
    const response = await api.post<Place[]>('/recommend/restaurants', data);
    return response.data;
};

export const recommendHotels = async (data: {
    user_id: number;
    current_lat: number;
    current_lon: number;
    radius_km: number;
}) => {
    const response = await api.post<Place[]>('/recommend/hotels', data);
    return response.data;
};

export const getNearbyHospitals = async (data: {
    current_lat: number;
    current_lon: number;
    radius_km: number;
}) => {
    const response = await api.post<Place[]>('/nearby/hospitals', data);
    return response.data;
};

export const createBooking = async (data: {
    user_id: number;
    place_id: number;
    booking_type: string;
}) => {
    const response = await api.post<Booking>('/bookings/', data);
    return response.data;
};

export const getUserBookings = async (userId: number) => {
    const response = await api.get<Booking[]>(`/bookings/user/${userId}`);
    return response.data;
};
