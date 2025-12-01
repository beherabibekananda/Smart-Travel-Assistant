import axios from 'axios';
import { API_BASE_URL } from './api';

export interface PaymentOrder {
    order_id: string;
    amount: number;
    currency: string;
    razorpay_key_id: string;
}

export interface PaymentVerification {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    booking_id: number;
}

export const createPaymentOrder = (bookingId: number, amount: number) => {
    const token = localStorage.getItem('token');
    return axios.post<PaymentOrder>(
        `${API_BASE_URL}/payments/create-order`,
        { booking_id: bookingId, amount },
        { headers: { Authorization: `Bearer ${token}` } }
    );
};

export const verifyPayment = (data: PaymentVerification) => {
    const token = localStorage.getItem('token');
    return axios.post(
        `${API_BASE_URL}/payments/verify`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
    );
};

export const getTransaction = (bookingId: number) => {
    const token = localStorage.getItem('token');
    return axios.get(`${API_BASE_URL}/payments/transaction/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
    });
};
