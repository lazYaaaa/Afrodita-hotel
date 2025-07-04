import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BookRoom = () => {
    const [rooms] = useState([
        {title: "Трёхместный номер c верандой", body: "Lorem ipsum", id: 1, cost: 3000},
        {title: "Четырёхместный номер с балконом", body: "Lorem ipsum", id: 2, cost: 4000},
        {title: "Семейный номер с балконом", body: "Lorem ipsum", id: 3, cost: 3000},
        {title: "Четырехместный номер", body: "Lorem ipsum", id: 4, cost: 3500}
    ]);
    
    const { id } = useParams();
    const room = rooms[id];
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        check_in: '',
        check_out: '',
        adults: 1,
        children: 0,
        phone: '',
        message: ''
    });
    const [errors, setErrors] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [bookedPeriods, setBookedPeriods] = useState([]);

useEffect(() => {
    const fetchBookedPeriods = async () => {
        try {
            const response = await axios.get(`http://localhost:8000/occupated_dates.php?room_id=${parseInt(id) + 1}`);
            const bookedData = response.data.booked_periods || [];
            const filteredData = bookedData.filter(
                booking => booking.status === 'confirmed' || booking.status === 'pending'
            );
            setBookedPeriods(filteredData);
        } catch (error) {
            console.error('Error fetching booked periods:', error);
        }
    };

    fetchBookedPeriods();
}, [id]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors([]);
    
        try {
            const response = await axios.post('http://localhost:8000/book.php', {
                book_room: true,
                room_id: parseInt(id) + 1,
                ...formData
            }, {
                withCredentials: true, // Важно для отправки cookies
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
    
            if (response.data.success) {
                navigate(`/booking_confirmation/${response.data.booking_id}`);
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    setErrors(['Требуется авторизация. Пожалуйста, войдите в систему.']);
                    navigate('/login'); // Перенаправляем на страницу входа
                } else if (error.response.data.errors) {
                    setErrors(error.response.data.errors);
                }
            } else {
                setErrors(['Ошибка сети или сервера']);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!room) {
        return <div>Комната не найдена</div>;
    }
    const getDayClassName = (date) => {
    for (const period of bookedPeriods) {
        const start = new Date(period.start);
        const end = new Date(period.end);
        const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());

        const diffDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

        if (dateOnly.getTime() >= startDate.getTime() && dateOnly.getTime() <= endDate.getTime()) {
            if (diffDays === 2) {
                // Для интервала из двух дней — подсвечиваем другим классом
                return 'booked-two-days';
            } else if (diffDays > 2) {
                // Для интервала из более чем двух дней — подсвечиваем внутренние дни
                if (dateOnly.getTime() !== startDate.getTime() && dateOnly.getTime() !== endDate.getTime()) {
                    return 'booked-date';
                }
            } else {
                // интервал из одного дня
                return 'booked-date';
            }
        }
    }
    return '';
};

    return (
        <div className="book-room">
            <h1>{room.title}</h1>
            <p>{room.body}</p>
            <p>Цена: {room.cost} руб./сутки</p>
            
            {errors.length > 0 && (
                <div className="errors">
                    {errors.map((error, index) => (
                        <p key={index} style={{color: 'red'}}>{error}</p>
                    ))}
                </div>
            )}
            
            <div className="booking-form">
                <h3>Форма бронирования</h3>
                <form onSubmit={handleSubmit}>
                <label>
    Дата заезда:
    <DatePicker
        selected={formData.check_in ? new Date(formData.check_in) : null}
        onChange={(date) => {
            if (date) {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const dateStr = `${year}-${month}-${day}`;
              setFormData({...formData, check_in: dateStr});
            } else {
              // Если дата очищена, можно установить пустую строку или null
              setFormData({...formData, check_in: ''});
            }
          }}
        selectsStart
        startDate={formData.check_in ? new Date(formData.check_in) : null}
        endDate={formData.check_out ? new Date(formData.check_out) : null}
        minDate={new Date()}
        excludeDateIntervals={bookedPeriods.map(period => ({
            start: new Date(period.start),
            end: new Date(period.end - 1)
        }))}
        dateFormat="yyyy-MM-dd"
        placeholderText="Выберите дату заезда"
        dayClassName={getDayClassName}
        required
    />
</label>

<label>
    Дата выезда:
    <DatePicker
        selected={formData.check_out ? new Date(formData.check_out) : null}
        onChange={(date) => {
            if (date) {
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, '0');
              const day = String(date.getDate()).padStart(2, '0');
              const dateStr = `${year}-${month}-${day}`;
              setFormData({...formData, check_out: dateStr});
            } else {
              setFormData({...formData, check_out: ''});
            }
          }}
        selectsEnd
        startDate={formData.check_in ? new Date(formData.check_in) : null}
        endDate={formData.check_out ? new Date(formData.check_out) : null}
        minDate={formData.check_in ? new Date(formData.check_in) : new Date()}
        excludeDateIntervals={bookedPeriods.map(period => ({
            start: new Date(period.start),
            end: new Date(period.end)
        }))}
        dateFormat="yyyy-MM-dd"
        placeholderText="Выберите дату выезда"
        required
        dayClassName={getDayClassName}
    />
</label>
                    
                    <label>
                        Взрослые:
                        <input 
                            type="number" 
                            name="adults" 
                            min="1" 
                            max="10"
                            value={formData.adults}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    
                    <label>
                        Дети:
                        <input 
                            type="number" 
                            name="children" 
                            min="0" 
                            max="10"
                            value={formData.children}
                            onChange={handleChange}
                        />
                    </label>
                    
                    <label>
                        Телефон:
                        <input 
                            type="tel" 
                            name="phone" 
                            value={formData.phone}
                            onChange={handleChange}
                            required
                            placeholder="+7 (XXX) XXX-XX-XX"
                        />
                    </label>
                    
                    <label>
                        Дополнительные пожелания:
                        <textarea 
                            name="message" 
                            value={formData.message}
                            onChange={handleChange}
                        />
                    </label>
                    <div className="legend" style={{ marginTop: '20px' }}>
                            <h4>Обозначения</h4>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ width: '20px', height: '20px', backgroundColor: 'orange', border: '1px solid #ccc', marginRight: '8px' }}></div>
                                <span>Можно занять один из дней</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{ width: '20px', height: '20px', backgroundColor: 'red', border: '1px solid #ccc', marginRight: '8px' }}></div>
                                <span>Бронь недоступна</span>
                                </div>
                            </div>
                            </div>
                    
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Обработка...' : 'Забронировать'}
                    </button>
                </form>
            </div>
            
            <button type='backButton' onClick={() => navigate(-1)}>Вернуться назад</button>
        </div>
    );
};

export default BookRoom;