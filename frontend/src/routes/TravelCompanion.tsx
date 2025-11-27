import { useState, useEffect } from 'react';
import { MapPin, Signal, CheckCircle, Compass, PenTool, Globe, Droplets, AlertTriangle, Battery } from 'lucide-react';

const TravelCompanion = () => {
    const [location, setLocation] = useState<string>('Fetching location...');
    const [networkStatus, setNetworkStatus] = useState<string>('Checking network...');
    const [remindersSet, setRemindersSet] = useState(false);

    useEffect(() => {
        // 1. Get Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // In a real app, we'd reverse geocode this. For now, showing coords or a mock address
                    // to match the "Fetching location..." -> "Location found" flow
                    setLocation(`Lat: ${position.coords.latitude.toFixed(4)}, Lon: ${position.coords.longitude.toFixed(4)}`);
                },
                (error) => {
                    setLocation('Location access denied');
                    console.error(error);
                }
            );
        } else {
            setLocation('Geolocation not supported');
        }

        // 2. Get Network Status
        const updateNetworkStatus = () => {
            const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
            if (connection) {
                const type = connection.effectiveType || 'unknown';
                const downlink = connection.downlink || 0;
                setNetworkStatus(`Type: ${type.toUpperCase()}, Downlink: ${downlink} Mb/s`);
            } else {
                setNetworkStatus('Network info unavailable');
            }
        };
        updateNetworkStatus();
        // Listen for changes if supported
        const connection = (navigator as any).connection;
        if (connection) {
            connection.addEventListener('change', updateNetworkStatus);
            return () => connection.removeEventListener('change', updateNetworkStatus);
        }
    }, []);

    const handleReminderToggle = () => {
        const newState = !remindersSet;
        setRemindersSet(newState);

        if (newState) {
            // Request notification permission
            if (Notification.permission !== 'granted') {
                Notification.requestPermission();
            }
            alert("Reminders set! You'll get an alert every 30 minutes to drink water, and every 60 minutes to call your parents.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="max-w-md w-full space-y-6">

                {/* Header Section */}
                <div className="text-center space-y-2 mb-8">
                    <h1 className="text-3xl font-bold text-green-400 flex items-center justify-center gap-2">
                        Smart Travel Assistant <Globe className="w-8 h-8 text-blue-400 animate-pulse" />
                    </h1>
                </div>

                {/* Status Card */}
                <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl p-6 shadow-xl space-y-4">

                    {/* Location */}
                    <div className="flex items-center gap-3 text-gray-200">
                        <MapPin className="w-5 h-5 text-red-500" />
                        <span className="font-medium">{location}</span>
                    </div>

                    {/* Network */}
                    <div className="flex items-center gap-3 text-gray-200">
                        <Signal className="w-5 h-5 text-orange-500" />
                        <span className="font-medium">{networkStatus}</span>
                    </div>

                    {/* Reminders Toggle */}
                    <div
                        onClick={handleReminderToggle}
                        className={`flex items-start gap-3 p-3 rounded-xl transition-all cursor-pointer border ${remindersSet ? 'bg-green-900/30 border-green-500/50' : 'bg-gray-700/30 border-transparent hover:bg-gray-700/50'}`}
                    >
                        <div className={`mt-1 p-0.5 rounded bg-white ${remindersSet ? 'text-green-600' : 'text-gray-400'}`}>
                            <CheckCircle className="w-4 h-4" />
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">
                            {remindersSet
                                ? "Reminders set! You'll get an alert every 30 minutes to drink water, and every 60 minutes to call your parents."
                                : "Tap to enable safety reminders (Water & Parents)"}
                        </p>
                    </div>
                </div>

                {/* Travel Tips Card */}
                <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Compass className="w-6 h-6 text-yellow-400" />
                        <h2 className="text-xl font-bold text-yellow-400">Travel Tips</h2>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-300">
                            <Droplets className="w-5 h-5 text-blue-400" />
                            <span>Carry a refillable water bottle</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                            <Battery className="w-5 h-5 text-green-400" />
                            <span>Keep your phone charged and share location</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-300">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                            <span>Stay aware of surroundings and save emergency numbers</span>
                        </div>
                    </div>
                </div>

                {/* Travel Sketch Card */}
                <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl p-6 shadow-xl h-48 flex flex-col items-center justify-center relative group cursor-pointer hover:bg-gray-800/70 transition-colors">
                    <div className="absolute top-6 left-6 flex items-center gap-2">
                        <PenTool className="w-6 h-6 text-cyan-400" />
                        <h2 className="text-xl font-bold text-cyan-400">Travel Sketch</h2>
                    </div>

                    <div className="mt-8 opacity-50 group-hover:opacity-100 transition-opacity flex flex-col items-center gap-2">
                        <div className="w-16 h-16 border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">+</span>
                        </div>
                        <span className="text-sm text-gray-400">Tap to start sketching</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TravelCompanion;
