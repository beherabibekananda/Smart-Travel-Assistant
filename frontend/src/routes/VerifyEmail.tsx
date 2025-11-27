import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, CheckCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const VerifyEmail: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const email = searchParams.get('email') || '';

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft > 0 && !success) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, success]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return; // Only digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Only last character
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split('');
        setOtp([...newOtp, ...Array(6 - newOtp.length).fill('')]);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await axios.post(`${API_BASE_URL}/auth/verify-email`, null, {
                params: { email, otp: otpCode }
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');

        try {
            await axios.post(`${API_BASE_URL}/auth/resend-otp`, null, {
                params: { email }
            });
            setOtp(['', '', '', '', '', '']);
            setTimeLeft(300);
            setError('');
            alert('New OTP sent to your email!');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to resend OTP.');
        } finally {
            setResending(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (success) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-full max-w-md text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
                    <p className="text-gray-600 mb-4">Your email has been successfully verified.</p>
                    <p className="text-sm text-gray-500">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-full max-w-md">
                <div className="flex items-center justify-center mb-6">
                    <Mail className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">Verify Your Email</h2>
                <p className="text-center text-gray-600 mb-6">
                    We've sent a 6-digit code to<br />
                    <span className="font-medium text-gray-900">{email}</span>
                </p>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg mb-6">
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                        Enter Verification Code
                    </label>
                    <div className="flex gap-2 justify-center">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                onPaste={handlePaste}
                                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                            />
                        ))}
                    </div>
                </div>

                <div className="text-center mb-6">
                    {timeLeft > 0 ? (
                        <p className="text-sm text-gray-600">
                            Code expires in <span className="font-medium text-blue-600">{formatTime(timeLeft)}</span>
                        </p>
                    ) : (
                        <p className="text-sm text-red-600 font-medium">Code expired</p>
                    )}
                </div>

                <button
                    onClick={handleVerify}
                    disabled={loading || otp.some(d => !d)}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center mb-4"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Verifying...
                        </>
                    ) : (
                        'Verify Email'
                    )}
                </button>

                <div className="text-center">
                    <button
                        onClick={handleResend}
                        disabled={resending || timeLeft > 240}
                        className="text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                    >
                        {resending ? 'Sending...' : "Didn't receive the code? Resend"}
                    </button>
                </div>

                <p className="text-center text-gray-600 mt-6 text-sm">
                    <Link to="/login" className="text-blue-600 hover:underline font-medium">
                        Back to Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default VerifyEmail;
