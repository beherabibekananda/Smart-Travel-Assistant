import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, MapPin, DollarSign, Heart, Star, TrendingUp } from 'lucide-react';

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="text-center fade-in-up">
                        <div className="inline-block p-3 bg-gradient-primary rounded-full float-animation mb-6">
                            <Plane className="w-12 h-12 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                            Your <span className="gradient-text">Smart</span> Travel
                            <br />
                            Companion Awaits
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto slide-in-left animate-delay-200">
                            Discover personalized recommendations, plan your perfect trip, and manage your bookings - all in one beautiful platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center slide-in-right animate-delay-300">
                            {user ? (
                                <>
                                    <Link
                                        to="/trip"
                                        className="px-8 py-4 bg-gradient-primary text-white text-lg font-semibold rounded-full gradient-button btn-hover shadow-strong transform hover:scale-110"
                                    >
                                        Start Planning
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="px-8 py-4 glass-card text-gray-800 text-lg font-semibold rounded-full card-hover shadow-medium"
                                    >
                                        View Profile
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/signup"
                                        className="px-8 py-4 bg-gradient-primary text-white text-lg font-semibold rounded-full gradient-button btn-hover shadow-strong transform hover:scale-110"
                                    >
                                        Get Started Free
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="px-8 py-4 glass-card text-gray-800 text-lg font-semibold rounded-full card-hover shadow-medium"
                                    >
                                        Sign In
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Floating Shapes Background */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 float-animation"></div>
                    <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 float-animation" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 float-animation" style={{ animationDelay: '4s' }}></div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <h2 className="text-4xl font-bold text-center mb-4 gradient-text fade-in-up">
                    Why Choose Smart Travel?
                </h2>
                <p className="text-center text-gray-600 mb-16 fade-in-up animate-delay-100">
                    Everything you need for the perfect trip, powered by AI
                </p>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <Link to="/trip" className="block">
                        <div className="glass-card p-8 rounded-2xl card-hover shadow-medium fade-in-up cursor-pointer">
                            <div className="p-4 bg-gradient-primary rounded-full w-fit mb-6">
                                <MapPin className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Smart Recommendations</h3>
                            <p className="text-gray-600">
                                AI-powered suggestions based on your diet preferences, budget, and location preferences.
                            </p>
                        </div>
                    </Link>

                    {/* Feature 2 */}
                    <Link to="/bookings" className="block">
                        <div className="glass-card p-8 rounded-2xl card-hover shadow-medium fade-in-up animate-delay-200 cursor-pointer">
                            <div className="p-4 bg-gradient-secondary rounded-full w-fit mb-6">
                                <DollarSign className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Budget Tracking</h3>
                            <p className="text-gray-600">
                                Keep your spending in check with real-time budget monitoring and expense tracking.
                            </p>
                        </div>
                    </Link>

                    {/* Feature 3 */}
                    <Link to="/profile" className="block">
                        <div className="glass-card p-8 rounded-2xl card-hover shadow-medium fade-in-up animate-delay-300 cursor-pointer">
                            <div className="p-4 bg-gradient-success rounded-full w-fit mb-6">
                                <Heart className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Save Favorites</h3>
                            <p className="text-gray-600">
                                Bookmark your favorite places and build your perfect travel itinerary with ease.
                            </p>
                        </div>
                    </Link>

                    {/* Feature 4 */}
                    <Link to="/trip" className="block">
                        <div className="glass-card p-8 rounded-2xl card-hover shadow-medium fade-in-up animate-delay-100 cursor-pointer">
                            <div className="p-4 bg-gradient-warm rounded-full w-fit mb-6">
                                <Star className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Reviews & Ratings</h3>
                            <p className="text-gray-600">
                                Read authentic reviews from travelers and share your own experiences with the community.
                            </p>
                        </div>
                    </Link>

                    {/* Feature 5 */}
                    <Link to="/trip" className="block">
                        <div className="glass-card p-8 rounded-2xl card-hover shadow-medium fade-in-up animate-delay-200 cursor-pointer">
                            <div className="p-4 bg-gradient-cool rounded-full w-fit mb-6">
                                <TrendingUp className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Live Weather</h3>
                            <p className="text-gray-600">
                                Stay updated with real-time weather forecasts for your destination to plan better.
                            </p>
                        </div>
                    </Link>

                    {/* Feature 6 */}
                    <Link to="/bookings" className="block">
                        <div className="glass-card p-8 rounded-2xl card-hover shadow-medium fade-in-up animate-delay-300 cursor-pointer">
                            <div className="p-4 bg-gradient-primary rounded-full w-fit mb-6">
                                <Plane className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Easy Booking</h3>
                            <p className="text-gray-600">
                                Book restaurants and hotels seamlessly with integrated payment and instant confirmation.
                            </p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* CTA Section */}
            {!user && (
                <div className="bg-gradient-primary py-20">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-4xl font-bold text-white mb-6 fade-in-up">
                            Ready to Start Your Journey?
                        </h2>
                        <p className="text-xl text-white/90 mb-8 fade-in-up animate-delay-100">
                            Join thousands of travelers who trust Smart Travel for their adventures
                        </p>
                        <Link
                            to="/signup"
                            className="inline-block px-10 py-4 bg-white text-purple-600 text-lg font-bold rounded-full hover:bg-gray-100 transition-all shadow-strong transform hover:scale-110 btn-hover fade-in-up animate-delay-200"
                        >
                            Create Free Account
                        </Link>
                    </div>
                </div>
            )}

            {/* Stats Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid md:grid-cols-4 gap-8 text-center">
                    <div className="fade-in-up">
                        <div className="text-5xl font-bold gradient-text mb-2">10K+</div>
                        <div className="text-gray-600">Active Users</div>
                    </div>
                    <div className="fade-in-up animate-delay-100">
                        <div className="text-5xl font-bold gradient-text mb-2">50K+</div>
                        <div className="text-gray-600">Bookings Made</div>
                    </div>
                    <div className="fade-in-up animate-delay-200">
                        <div className="text-5xl font-bold gradient-text mb-2">100+</div>
                        <div className="text-gray-600">Cities Covered</div>
                    </div>
                    <div className="fade-in-up animate-delay-300">
                        <div className="text-5xl font-bold gradient-text mb-2">4.8★</div>
                        <div className="text-gray-600">Average Rating</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
