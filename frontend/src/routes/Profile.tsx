import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createUser, getUser } from '../services/api';
import { Save, User as UserIcon } from 'lucide-react';

const Profile: React.FC = () => {
    const [userId, setUserId] = useState<number | null>(() => {
        const stored = localStorage.getItem('user_id');
        return stored ? parseInt(stored) : null;
    });

    const [formData, setFormData] = useState({
        name: '',
        age: 25,
        diet_type: 'VEG',
        daily_food_budget: 1000,
        hotel_budget_per_night: 5000,
    });

    const { data: user, refetch } = useQuery({
        queryKey: ['user', userId],
        queryFn: () => getUser(userId!).then(res => res.data),
        enabled: !!userId,
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                age: user.age,
                diet_type: user.diet_type,
                daily_food_budget: user.daily_food_budget,
                hotel_budget_per_night: user.hotel_budget_per_night,
            });
        }
    }, [user]);

    const mutation = useMutation({
        mutationFn: (data: any) => createUser(data).then(res => res.data),
        onSuccess: (data) => {
            localStorage.setItem('user_id', data.id.toString());
            setUserId(data.id);
            refetch();
            alert('Profile saved successfully!');
        },
        onError: (error) => {
            console.error('Error saving profile:', error);
            alert('Failed to save profile.');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'age' || name.includes('budget') ? parseFloat(value) : value,
        }));
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <UserIcon className="w-8 h-8 text-blue-600" />
                User Profile
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Diet Preference</label>
                            <select
                                name="diet_type"
                                value={formData.diet_type}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            >
                                <option value="VEG">Vegetarian (VEG)</option>
                                <option value="VEGAN">Vegan</option>
                                <option value="JAIN">Jain</option>
                                <option value="NON_VEG_NO_BEEF">Non-Veg (No Beef)</option>
                                <option value="LOW_CARB">Low Carb</option>
                                <option value="DIABETIC_FRIENDLY">Diabetic Friendly</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Daily Food Budget (₹)</label>
                                <input
                                    type="number"
                                    name="daily_food_budget"
                                    value={formData.daily_food_budget}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Budget / Night (₹)</label>
                                <input
                                    type="number"
                                    name="hotel_budget_per_night"
                                    value={formData.hotel_budget_per_night}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {mutation.isPending ? 'Saving...' : 'Save Profile'} <Save className="w-5 h-5" />
                        </button>
                    </form>
                </div>

                <div className="md:col-span-1">
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h3 className="text-lg font-bold text-blue-900 mb-4">Current Profile</h3>
                        {user ? (
                            <div className="space-y-3 text-sm text-blue-800">
                                <p><span className="font-semibold">Name:</span> {user.name}</p>
                                <p><span className="font-semibold">Diet:</span> {user.diet_type}</p>
                                <p><span className="font-semibold">Food Budget:</span> ₹{user.daily_food_budget}</p>
                                <p><span className="font-semibold">Hotel Budget:</span> ₹{user.hotel_budget_per_night}</p>
                            </div>
                        ) : (
                            <p className="text-blue-600 text-sm">No profile loaded. Please create one.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
