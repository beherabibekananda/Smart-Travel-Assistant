import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserBookings, cancelBooking } from '../services/api';
import { Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Bookings: React.FC = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: bookings, isLoading } = useQuery({
        queryKey: ['bookings', user?.id],
        queryFn: () => getUserBookings(user!.id).then(res => res.data),
        enabled: !!user?.id,
    });

    const cancelMutation = useMutation({
        mutationFn: cancelBooking,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookings'] });
        },
    });

    const handleCancel = (bookingId: number) => {
        if (window.confirm('Are you sure you want to cancel this booking?')) {
            cancelMutation.mutate(bookingId);
        }
    };

    if (!user) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <p className="text-gray-500">Please create a profile to view bookings.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                My Bookings
            </h2>

            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Loading bookings...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {bookings && bookings.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${booking.booking_type === 'RESTAURANT' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {booking.booking_type}
                                            </span>
                                            <span className="text-gray-400 text-sm">•</span>
                                            <span className="text-gray-500 text-sm">{new Date(booking.timestamp).toLocaleDateString()}</span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900">Booking #{booking.id}</h3>
                                        <p className="text-gray-600 text-sm">Place ID: {booking.place_id}</p>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {booking.status === 'CONFIRMED' ? <CheckCircle className="w-4 h-4" /> : booking.status === 'CANCELLED' ? <XCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                            {booking.status}
                                        </div>

                                        {booking.status === 'CONFIRMED' && (
                                            <button
                                                onClick={() => handleCancel(booking.id)}
                                                className="text-xs text-red-600 hover:text-red-800 underline"
                                                disabled={cancelMutation.isPending}
                                            >
                                                Cancel Booking
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            No bookings found. Go plan a trip!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Bookings;
