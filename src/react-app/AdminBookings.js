import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/AdminBookings.css';

const AdminBookings = ({ user }) => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedBooking, setExpandedBooking] = useState(null);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [confirmedCount, setConfirmedCount] = useState(0);

    const fetchBookings = async () => {
        try {
            const response = await axios.get('http://localhost:8000/all_occupations.php', {
                withCredentials: true,
            });
            
            if (response.data && response.data.success === false) {
                throw new Error(response.data.message || 'Server error');
            }
            
            setBookings(response.data?.bookings || []);
            
            // Calculate total revenue and count only for confirmed bookings
            if (response.data?.bookings) {
                let revenue = 0;
                let count = 0;
                
                response.data.bookings.forEach(booking => {
                    if (booking.status === 'confirmed') {
                        const checkIn = new Date(booking.check_in);
                        const checkOut = new Date(booking.check_out);
                        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                        revenue += booking.room_cost * nights;
                        count++;
                    }
                });
                
                setTotalRevenue(revenue);
                setConfirmedCount(count);
            }
        } catch (err) {
            console.error('Full error:', err.response?.data || err.message);
            setError(err.response?.data?.message || 
                    err.message || 
                    'Не удалось загрузить бронирования');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить это бронирование?')) {
            return;
        }
        
        try {
            const response = await axios.delete('http://localhost:8000/all_occupations.php', {
                data: { id },
                withCredentials: true,
            });
            
            if (response.data.success) {
                setBookings(bookings.filter(booking => booking.id !== id));
                // Recalculate totals after deletion
                fetchBookings();
            }
        } catch (err) {
            console.error('Ошибка удаления:', err);
            alert('Не удалось удалить бронирование');
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const response = await axios.post(
                'http://localhost:8000/all_occupations.php',
                { id, status: newStatus },
                { withCredentials: true }
            );
            
            if (response.data.success) {
                setBookings(bookings.map(booking => 
                    booking.id === id ? {...booking, status: newStatus} : booking
                ));
                // Recalculate totals after status change
                fetchBookings();
            }
        } catch (err) {
            console.error('Ошибка изменения статуса:', err);
            alert('Не удалось изменить статус бронирования');
        }
    };

    const toggleExpandBooking = (id) => {
        setExpandedBooking(expandedBooking === id ? null : id);
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    if (!user?.is_admin) {
        return <div className="admin-message error">Доступ запрещен. Требуются права администратора.</div>;
    }

    if (loading) {
        return <div className="admin-message loading">Загрузка данных...</div>;
    }

    if (error) {
        return <div className="admin-message error">Ошибка: {error}</div>;
    }

    return (
        <div className="admin-bookings-container">
            <div className="admin-header">
                <h2 className="admin-title">Управление бронированиями</h2>
                <div className="total-revenue">
                    Общий доход: <span>{totalRevenue.toFixed(2)} ₽</span>
                </div>
            </div>
            
            {bookings.length === 0 ? (
                <p className="no-bookings">Бронирования отсутствуют</p>
            ) : (
                <div className="bookings-list">
                    {bookings.map((booking) => {
                        const checkIn = new Date(booking.check_in);
                        const checkOut = new Date(booking.check_out);
                        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
                        const totalCost = booking.room_cost * nights;
                        const nightsText = nights === 1 ? 'ночь' : 
                                         nights > 1 && nights < 5 ? 'ночи' : 'ночей';

                        return (
                            <div key={booking.id} className="booking-card">
                                <div 
                                    className="booking-summary"
                                    onClick={() => toggleExpandBooking(booking.id)}
                                >
                                    <div className="booking-id">#{booking.id}</div>
                                    <div className="booking-user">
                                        {booking.user_name} 
                                    </div>
                                    <div className="booking-room">
                                        {booking.room_title} ({booking.room_cost} ₽/ночь)
                                    </div>
                                    <div className="booking-dates">
                                        {checkIn.toLocaleDateString()} - {checkOut.toLocaleDateString()}
                                        <span className="nights-count">({nights} {nightsText})</span>
                                    </div>
                                    <div className="booking-total">
                                        Итого: {totalCost.toFixed(2)} ₽
                                    </div>
                                    <div className={`booking-status ${booking.status}`}>
                                        {booking.status === 'confirmed' && 'Подтверждено'}
                                        {booking.status === 'cancelled' && 'Отменено'}
                                        {booking.status === 'pending' && 'Ожидает подтверждения'}
                                    </div>
                                </div>
                                
                                {expandedBooking === booking.id && (
                                    <div className="booking-details">
                                        <div className="detail-row">
                                            <span className="detail-label">Телефон:</span>
                                            <span>{booking.phone}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Почта:</span>
                                            <span>{booking.user_email}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Взрослые:</span>
                                            <span>{booking.adults}</span>
                                        </div>
                                        <div className="detail-row">
                                            <span className="detail-label">Дети:</span>
                                            <span>{booking.children}</span>
                                        </div>
                                        
                                        
                                        {booking.message && (
                                            <div className="detail-row message">
                                                <span className="detail-label">Пожелания:</span>
                                                <p>{booking.message}</p>
                                            </div>
                                        )}
                                        <div className="action-buttons">
                                            <button 
                                                className="delete-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(booking.id);
                                                }}
                                            >
                                                Удалить
                                            </button>
                                            <div className="status-buttons">
                                                {booking.status !== 'confirmed' && (
                                                    <button
                                                        className="status-btn confirm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusChange(booking.id, 'confirmed');
                                                        }}
                                                    >
                                                        Подтвердить
                                                    </button>
                                                )}
                                                {booking.status !== 'cancelled' && (
                                                    <button
                                                        className="status-btn reject"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStatusChange(booking.id, 'cancelled');
                                                        }}
                                                    >
                                                        Отклонить
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AdminBookings;