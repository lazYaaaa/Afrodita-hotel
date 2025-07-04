import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BookingConfirmation = () => {
    const { id } = useParams(); // Исправлено: useParams вместо userarems
    const navigate = useNavigate(); // Исправлено: useNavigate вместо uselwavigate
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/book_confirm.php?id=${id}`, {
                    withCredentials: true
                });
                
                if (response.data.success) {
                    setBooking(response.data.booking);
                } else {
                    setError(response.data.error || 'Бронирование не найдено');
                }
            } catch (err) {
                setError('Ошибка при загрузке данных бронирования');
                console.error("Ошибка:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBooking();
    }, [id]);

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div>{error}</div>;
    if (!booking) return <div>Данные бронирования не найдены</div>;

    return (
        <div className="confirmation-container">
            <h2>Заявка создана!</h2>
            <p>Номер бронирования: #{booking.id}</p>
            <p>Комната: {booking.room_title}</p>
            <p>Дата заезда: {new Date(booking.check_in).toLocaleDateString()}</p>
            <p>Дата выезда: {new Date(booking.check_out).toLocaleDateString()}</p>
            <p>Гости: {booking.adults} взрослых, {booking.children} детей</p>
            <p>Телефон: {booking.phone}</p>
            <button onClick={() => navigate('/')}>Вернуться на главную</button>
        </div>
    );
};

export default BookingConfirmation;