import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, User, LogOut, Home, Calendar, BookmarkIcon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="glass-card sticky top-0 z-50 shadow-strong">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="p-2 bg-gradient-primary rounded-lg icon-hover">
                            <Plane className="w-6 h-6 text-white transform group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                        <span className="text-xl font-bold gradient-text">
                            Smart Travel
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <Link
                                    to="/"
                                    className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300"
                                >
                                    <Home className="w-4 h-4" />
                                    <span className="hidden sm:inline">Home</span>
                                </Link>
                                <Link
                                    to="/trip"
                                    className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300"
                                >
                                    <Calendar className="w-4 h-4" />
                                    <span className="hidden sm:inline">Plan Trip</span>
                                </Link>
                                <Link
                                    to="/bookings"
                                    className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300"
                                >
                                    <BookmarkIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">Bookings</span>
                                </Link>
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300"
                                >
                                    <User className="w-4 h-4" />
                                    <span className="hidden sm:inline">Profile</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1 px-4 py-2 bg-gradient-primary text-white rounded-lg gradient-button btn-hover transform hover:scale-105"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-4 py-2 bg-gradient-primary text-white rounded-lg gradient-button btn-hover transform hover:scale-105"
                                >
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
