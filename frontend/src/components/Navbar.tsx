import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Map, User, Calendar, Home } from 'lucide-react';

const Navbar: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-500';
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
                        <Map className="w-6 h-6" />
                        <span>Smart Travel</span>
                    </Link>

                    <div className="flex space-x-6">
                        <Link to="/" className={`flex items-center gap-1 ${isActive('/')}`}>
                            <Home className="w-4 h-4" />
                            <span className="hidden sm:inline">Home</span>
                        </Link>
                        <Link to="/profile" className={`flex items-center gap-1 ${isActive('/profile')}`}>
                            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">Profile</span>
                        </Link>
                        <Link to="/trip" className={`flex items-center gap-1 ${isActive('/trip')}`}>
                            <Map className="w-4 h-4" />
                            <span className="hidden sm:inline">Trip</span>
                        </Link>
                        <Link to="/bookings" className={`flex items-center gap-1 ${isActive('/bookings')}`}>
                            <Calendar className="w-4 h-4" />
                            <span className="hidden sm:inline">Bookings</span>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
