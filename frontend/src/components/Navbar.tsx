import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center space-x-2">
                        <Plane className="w-8 h-8 text-blue-600" />
                        <span className="text-xl font-bold text-gray-900">Smart Travel</span>
                    </Link>

                    <div className="flex items-center space-x-6">
                        {isAuthenticated ? (
                            <>
                                <Link to="/profile" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                                    Profile
                                </Link>
                                <Link to="/trip" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                                    Trip
                                </Link>
                                <Link to="/bookings" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                                    Bookings
                                </Link>
                                <span className="text-gray-600 text-sm">{user?.email}</span>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                                    Login
                                </Link>
                                <Link to="/signup" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
