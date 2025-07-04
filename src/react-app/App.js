import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom'; // Импортируем Navigate
import Navbar from './Navbar';
import Home from './Home';
import Login from './Login';
import Registration from './Registration';
import BookRoom from './BookRoom';
import BookingConfirmation from './BookingConfirmation';
import axios from 'axios';
import SideBar from './sideBar';
import MyBookings from './MyBookings';
import Footer from './Footer';
import AdminBookings from './AdminBookings';

function App() {
    const [user, setUser] = useState(null); // null: статус неизвестен, {} или null: не авторизован, {id, username}: авторизован
    const [authStatusChecked, setAuthStatusChecked] = useState(false); // Новый флаг

    // Проверяем авторизацию при загрузке приложения
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await axios.get('http://localhost:8000/check_auth.php', {
                    withCredentials: true,
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                if (response.data.authenticated) {
                    setUser(response.data.user);
                } else {
                    setUser(null); // Устанавливаем null или {} для "не авторизован"
                }
            } catch (error) {
                console.error("Ошибка проверки авторизации:", error);
                setUser(null); // В случае ошибки тоже считаем, что не авторизован

                // Убираем попытку чтения из localStorage при ошибке CORS здесь.
                // Лучше полагаться только на бэкенд для статуса аутентификации.
                // localStorage можно использовать для хранения НЕчувствительных данных или настроек.
            } finally {
                setAuthStatusChecked(true); // Проверка завершена
            }
        };

        checkAuth();
    }, []); // Пустой массив зависимостей: выполняется один раз при монтировании

    const handleLoginSuccess = async (userData) => {
    // Сразу сохраняем userData (где есть is_admin из login.php)
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Сохраняем все данные
    
    // Дополнительная проверка auth (если нужна)
    try {
        const response = await axios.get('http://localhost:8000/check_auth.php', {
            withCredentials: true,
            params: { extended: 'true' } // Запрашиваем полные данные
        });
        
        if (response.data.authenticated) {
            // Обновляем только если есть новые данные
            setUser(prev => ({ ...prev, ...response.data.user }));
        }
    } catch (error) {
        console.error('Ошибка проверки авторизации:', error);
    }
};

    const handleLogout = async () => {
        try {
            const response = await axios.post('http://localhost:8000/logout.php',
                {}, // Пустое тело запроса
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                setUser(null);
                localStorage.removeItem('user');
                console.log("Выход выполнен успешно");
            } else {
                 // Даже если сервер ответил success: false, на клиенте сбрасываем состояние
                 setUser(null);
                 localStorage.removeItem('user');
                 console.warn("Сервер ответил success: false при выходе");
            }
        } catch (error) {
            console.error("Ошибка при выходе:", error);
            // Принудительный выход на клиенте, даже если сервер не ответил
            setUser(null);
            localStorage.removeItem('user');
        }
    };

    // Пока статус аутентификации не проверен, показываем заглушку
    if (!authStatusChecked) {
        return <div className="app-loading">Загрузка приложения...</div>;
    }

    // Теперь authStatusChecked === true, user либо null (не авторизован), либо объект пользователя (авторизован)

    return (
        <Router>
            <div className="App">
                <Navbar user={user} onLogout={handleLogout} />
                <SideBar />
                <div className="content">
                    <Routes>
                        {/* Публичные маршруты */}
                        <Route path="/" element={<Home user={user} />} />
                        {/* Если пользователь авторизован, перенаправляем с Login/Registration на главную */}
                        <Route
                            path="/login"
                            element={user ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />}
                        />
                         <Route
                            path="/registration"
                            element={user ? <Navigate to="/" replace /> : <Registration onRegistrationSuccess={handleLoginSuccess} />}
                        />

                        {/* Приватные маршруты */}
                        {/* Используем условный рендеринг для защиты */}
                        <Route
                            path="/book/:id"
                            element={user ? <BookRoom user={user} /> : <Navigate to="/login" replace />}
                        />
                        <Route
                            path="/booking_confirmation/:id"
                            element={user ? <BookingConfirmation user={user} /> : <Navigate to="/login" replace />}
                        />
                        <Route
                            path="/my-bookings"
                            // Передаем user в MyBookings, но рендерим его только если user существует
                            element={user ? <MyBookings user={user} /> : <Navigate to="/login" replace />}
                        />
                       <Route
                            path="/admin/bookings"
                            element={user?.is_admin ? <AdminBookings user={user} /> : <Navigate to="/" replace />}
                            />

                         {/* Маршрут по умолчанию для несуществующих страниц */}
                         {/* <Route path="*" element={<NotFoundPage />} /> */}

                    </Routes>
                </div>
                <Footer> </Footer>
            </div>
        </Router>
        
    );
}

export default App;
