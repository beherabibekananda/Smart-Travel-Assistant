import React, { useState } from 'react';
import { createPaymentOrder, verifyPayment } from '../services/payment';
import { CreditCard, X } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: number;
    amount: number;
    placeName: string;
    onSuccess: () => void;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    bookingId,
    amount,
    placeName,
    onSuccess
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handlePayment = async () => {
        setLoading(true);
        setError('');

        try {
            // Create order
            const orderResponse = await createPaymentOrder(bookingId, amount);
            const { order_id, razorpay_key_id } = orderResponse.data;

            // Razorpay options
            const options = {
                key: razorpay_key_id,
                amount: amount * 100, // Amount in paise
                currency: 'INR',
                name: 'Smart Travel Assistant',
                description: `Booking for ${placeName}`,
                order_id: order_id,
                handler: async function (response: any) {
                    try {
                        // Verify payment
                        await verifyPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            booking_id: bookingId
                        });

                        alert('Payment successful! Your booking is confirmed.');
                        onSuccess();
                        onClose();
                    } catch (err) {
                        setError('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: localStorage.getItem('user_name') || '',
                    email: localStorage.getItem('user_email') || ''
                },
                theme: {
                    color: '#2563eb'
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
            setLoading(false);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to initiate payment');
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                        Complete Payment
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-medium">Booking for:</span>
                        <span className="text-gray-900 font-bold">{placeName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">Amount:</span>
                        <span className="text-2xl font-bold text-blue-600">₹{amount.toFixed(2)}</span>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            <CreditCard className="w-5 h-5" />
                            Pay ₹{amount.toFixed(2)}
                        </>
                    )}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                    Secure payment powered by Razorpay
                </p>
            </div>
        </div>
    );
};

export default PaymentModal;
