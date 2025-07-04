import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const MyBookings = ({ user }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);
    const navigate = useNavigate();

    const fetchBookings = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.get('http://localhost:8000/myBookings.php', {
                withCredentials: true
            });
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Ошибка загрузки');
            }
            
            setBookings(response.data.data?.bookings || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Ошибка загрузки');
            if (err.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const handleCancel = async (bookingId) => {
        try {
            setCancellingId(bookingId);
            setError(null);
            
            const response = await axios.delete('http://localhost:8000/myBookings.php', {
                data: { id: bookingId },
                withCredentials: true
            });
            
            if (!response.data.success) {
                throw new Error(response.data.message || 'Ошибка отмены');
            }
            
            setBookings(prev => prev.filter(b => b.id !== bookingId));
        } catch (err) {
            console.error('Ошибка отмены:', err);
            setError(err.response?.data?.message || err.message || 'Не удалось отменить бронь');
        } finally {
            setCancellingId(null);
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchBookings();
    }, [user, navigate, fetchBookings]);

    const calculateTotalCost = (checkIn, checkOut, cost) => {
        const days = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
        return (cost * days).toFixed(2);
    };

    const getStatusClass = (status) => {
    switch (status) {
        case 'confirmed':
            return 'status-badge confirmed';
        case 'cancelled':
            return 'status-badge cancelled';
        case 'pending':
            return 'status-badge pending';
        case 'completed':
            return 'status-badge completed';
        default:
            return 'status-badge';
    }
};

    if (loading) return <div className="loading">Загрузка ваших бронирований...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="my-bookings">
            <h1>Мои Бронирования</h1>
            
            {bookings.length === 0 && !loading ? (
                <p className="no-bookings">У вас нет активных бронирований</p>
            ) : (
                <div className="bookings-grid">
                    {bookings.map(booking => {
                        const nights = Math.ceil(
                            (new Date(booking.check_out) - new Date(booking.check_in)) 
                            / (1000 * 60 * 60 * 24)
                        );
                        const totalCost = calculateTotalCost(
                            booking.check_in, 
                            booking.check_out, 
                            booking.room_cost
                        );

                        return (
                            <div key={booking.id} className="booking-card">
                                <div className="booking-header">
                                    <h3>{booking.room_title}</h3>
                                    <span 
                                        
                                        className={getStatusClass(booking.status)}
                                    >
                                        {booking.status === 'confirmed' && 'Подтверждено'}
                                        {booking.status === 'cancelled' && 'Отменено'}
                                        {booking.status === 'pending' && 'Ожидание'}
                                        {booking.status === 'completed' && 'Завершено'}
                                    </span>
                                </div>
                                
                                <div className="booking-details">
                                    <p>
                                        <strong>Даты:</strong> {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                                        <span className="nights"> ({nights} {nights === 1 ? 'ночь' : nights > 1 && nights < 5 ? 'ночи' : 'ночей'})</span>
                                    </p>
                                    
                                    <p><strong>Стоимость:</strong> {totalCost} руб.</p>
                                    <p><strong>Гостей:</strong> {booking.adults} взрослых {booking.children > 0 ? `, ${booking.children} детей` : ''}</p>
                                    
                                    {booking.message && (
                                        <p className="message">
                                            <strong>Ваши пожелания:</strong> {booking.message}
                                        </p>
                                    )}
                                </div>
                                
                                {booking.status !== 'cancelled' && (
                                    <button 
                                        onClick={() => handleCancel(booking.id)}
                                        className="cancel-btn"
                                        disabled={cancellingId === booking.id}
                                    >
                                        {cancellingId === booking.id ? 'Отмена...' : 'Отменить бронь'}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyBookings;