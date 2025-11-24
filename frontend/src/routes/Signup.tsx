import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';

const Signup: React.FC = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        age: 25,
        diet_type: 'VEG',
        daily_food_budget: 1000,
        hotel_budget_per_night: 3000,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signup(formData);
            navigate('/profile');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'age' || name.includes('budget') ? parseFloat(value) : value
        }));
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-full max-w-md">
                <div className="flex items-center justify-center mb-6">
                    <UserPlus className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">Create Account</h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="your@email.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="••••••••"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <input
                            type="number"
                            name="age"
                            value={formData.age}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Diet Preference</label>
                        <select
                            name="diet_type"
                            value={formData.diet_type}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="VEG">Vegetarian</option>
                            <option value="VEGAN">Vegan</option>
                            <option value="JAIN">Jain</option>
                            <option value="NON_VEG_NO_BEEF">Non-Veg (No Beef)</option>
                            <option value="LOW_CARB">Low Carb</option>
                            <option value="DIABETIC_FRIENDLY">Diabetic Friendly</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Daily Food Budget (₹)</label>
                        <input
                            type="number"
                            name="daily_food_budget"
                            value={formData.daily_food_budget}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Budget per Night (₹)</label>
                        <input
                            type="number"
                            name="hotel_budget_per_night"
                            value={formData.hotel_budget_per_night}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-center text-gray-600 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
