import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Utensils, Hotel, Activity } from 'lucide-react';

const Home: React.FC = () => {
    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="max-w-4xl w-full text-center space-y-8">
                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
                    Smart Travel <span className="text-blue-600">Assistant</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Your personal AI-powered travel companion. Get diet-aware restaurant recommendations, find the best hotels, and locate nearby hospitals instantly.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                    <Link
                        to="/profile"
                        className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        Set up Profile <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                        to="/trip"
                        className="px-8 py-4 bg-white text-gray-800 border border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                    >
                        Plan a Trip
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                            <Utensils className="w-6 h-6 text-orange-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Diet-Aware Dining</h3>
                        <p className="text-gray-600">Find restaurants that match your specific diet needs, from Vegan to Diabetic-friendly.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                            <Hotel className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Stays</h3>
                        <p className="text-gray-600">Discover hotels that fit your budget and preference, ranked by our smart algorithm.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                            <Activity className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Emergency Ready</h3>
                        <p className="text-gray-600">Instantly locate nearby hospitals and medical facilities wherever you are.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
