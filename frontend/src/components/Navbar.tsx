import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, User, LogOut, Home, Calendar, BookmarkIcon, Menu, X } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsOpen(false);
        navigate('/login');
    };

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav className="glass-card sticky top-0 z-50 shadow-strong bg-white/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo/Brand */}
                    <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsOpen(false)}>
                        <div className="p-2 bg-gradient-primary rounded-lg icon-hover">
                            <Plane className="w-6 h-6 text-white transform group-hover:translate-x-1 transition-transform duration-300" />
                        </div>
                        <span className="text-xl font-bold gradient-text">
                            Smart Travel
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <>
                                <Link
                                    to="/"
                                    className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300"
                                >
                                    <Home className="w-4 h-4" />
                                    <span>Home</span>
                                </Link>
                                <Link
                                    to="/trip"
                                    className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300"
                                >
                                    <Calendar className="w-4 h-4" />
                                    <span>Plan Trip</span>
                                </Link>
                                <Link
                                    to="/bookings"
                                    className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300"
                                >
                                    <BookmarkIcon className="w-4 h-4" />
                                    <span>Bookings</span>
                                </Link>
                                <Link
                                    to="/profile"
                                    className="flex items-center gap-1 px-4 py-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-300"
                                >
                                    <User className="w-4 h-4" />
                                    <span>Profile</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1 px-4 py-2 bg-gradient-primary text-white rounded-lg gradient-button btn-hover transform hover:scale-105"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
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

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white shadow-lg border-t border-gray-100 animate-in slide-in-from-top-5 duration-200">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        {user ? (
                            <>
                                <Link
                                    to="/"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Home className="w-5 h-5" />
                                    <span className="font-medium">Home</span>
                                </Link>
                                <Link
                                    to="/trip"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Calendar className="w-5 h-5" />
                                    <span className="font-medium">Plan Trip</span>
                                </Link>
                                <Link
                                    to="/bookings"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <BookmarkIcon className="w-5 h-5" />
                                    <span className="font-medium">Bookings</span>
                                </Link>
                                <Link
                                    to="/profile"
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <User className="w-5 h-5" />
                                    <span className="font-medium">Profile</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-medium">Logout</span>
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-3 mt-4">
                                <Link
                                    to="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full text-center px-4 py-3 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    onClick={() => setIsOpen(false)}
                                    className="w-full text-center px-4 py-3 bg-gradient-primary text-white rounded-lg font-medium shadow-md"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
