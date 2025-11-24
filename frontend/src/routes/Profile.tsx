import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUser, updateProfile, getFavorites, getSearchHistory } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Calendar, Utensils, DollarSign, Bed, Edit2, MapPin, Heart, Clock, History } from 'lucide-react';

const Profile: React.FC = () => {
    const { user: authUser } = useAuth();
    const queryClient = useQueryClient();
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');

    // Fetch User Data
    const { data: user, isLoading } = useQuery({
        queryKey: ['user', authUser?.id],
        queryFn: () => getUser(authUser!.id).then(res => res.data),
        enabled: !!authUser?.id,
    });

    // Fetch Favorites
    const { data: favorites } = useQuery({
        queryKey: ['favorites', authUser?.id],
        queryFn: () => getFavorites().then(res => res.data),
        enabled: !!authUser?.id,
    });

    // Fetch Search History
    const { data: history } = useQuery({
        queryKey: ['history', authUser?.id],
        queryFn: () => getSearchHistory().then(res => res.data),
        enabled: !!authUser?.id,
    });

    // Update Profile Mutation (Avatar)
    const updateAvatarMutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            setIsEditingAvatar(false);
        },
    });

    const handleAvatarUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        updateAvatarMutation.mutate({ avatar_url: avatarUrl });
    };

    if (isLoading) return <div className="flex justify-center items-center h-64">Loading profile...</div>;
    if (!user) return <div className="text-center text-red-500">User not found. Please log in.</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32 relative">
                            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                                <div className="relative group">
                                    <img
                                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                                        alt={user.name}
                                        className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover"
                                    />
                                    <button
                                        onClick={() => {
                                            setAvatarUrl(user.avatar_url || '');
                                            setIsEditingAvatar(!isEditingAvatar);
                                        }}
                                        className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="pt-16 pb-6 px-6 text-center">
                            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
                            <p className="text-gray-500 text-sm flex items-center justify-center gap-1 mt-1">
                                <Mail className="w-3 h-3" /> {user.email}
                            </p>

                            {isEditingAvatar && (
                                <form onSubmit={handleAvatarUpdate} className="mt-4">
                                    <input
                                        type="url"
                                        placeholder="Enter Image URL"
                                        value={avatarUrl}
                                        onChange={(e) => setAvatarUrl(e.target.value)}
                                        className="w-full text-sm border border-gray-300 rounded px-2 py-1 mb-2"
                                    />
                                    <button type="submit" className="text-xs bg-blue-600 text-white px-3 py-1 rounded">Save</button>
                                </form>
                            )}
                        </div>

                        <div className="border-t border-gray-100 px-6 py-4 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 flex items-center gap-2"><User className="w-4 h-4" /> Age</span>
                                <span className="font-medium text-gray-900">{user.age} years</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 flex items-center gap-2"><Utensils className="w-4 h-4" /> Diet</span>
                                <span className="font-medium text-gray-900">{user.diet_type}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Food Budget</span>
                                <span className="font-medium text-gray-900">₹{user.daily_food_budget}/day</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 flex items-center gap-2"><Bed className="w-4 h-4" /> Hotel Budget</span>
                                <span className="font-medium text-gray-900">₹{user.hotel_budget_per_night}/night</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Joined</span>
                                <span className="font-medium text-gray-900">{new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Favorites & History */}
                <div className="md:col-span-2 space-y-8">
                    {/* Favorites Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Heart className="w-5 h-5 text-red-500" /> Favorite Places
                        </h2>
                        {favorites && favorites.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {favorites.map((fav: any) => (
                                    <div key={fav.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <h3 className="font-semibold text-gray-900">{fav.place.name}</h3>
                                        <p className="text-xs text-gray-500 mb-2">{fav.place.place_type}</p>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <MapPin className="w-3 h-3 mr-1" />
                                            {fav.place.rating} ★
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No favorite places yet.</p>
                        )}
                    </div>

                    {/* Search History Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <History className="w-5 h-5 text-blue-500" /> Recent Searches
                        </h2>
                        {history && history.length > 0 ? (
                            <div className="space-y-3">
                                {history.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between border-b border-gray-50 pb-2 last:border-0">
                                        <div>
                                            <p className="font-medium text-gray-800">{item.query}</p>
                                            {item.location && <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.location}</p>}
                                        </div>
                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(item.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">No search history yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
