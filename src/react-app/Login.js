import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLoginSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors([]);
        setSuccessMessage('');

        try {
            const response = await fetch('http://localhost:8000/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    login: true
                }),
                credentials: 'include',
            });

            // Проверяем Content-Type перед парсингом JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Сервер вернул не JSON ответ');
            }

            const data = await response.json();

            if (!response.ok) {
                setErrors(data.errors || ['Ошибка при входе. Проверьте данные.']);
                return;
            }

            if (data.success) {
                setSuccessMessage(data.message || 'Вход выполнен успешно!');
                onLoginSuccess({
                    id: data.user_id,
                    username: data.username,
                    email: data.email
                });
                navigate('/');
            } else {
                setErrors(data.errors || ['Неизвестная ошибка при входе.']);
            }
        } catch (error) {
            console.error("Ошибка при отправке запроса:", error);
            setErrors(['Ошибка соединения с сервером. Попробуйте позже.']);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Вход</h2>
                
                {errors.length > 0 && (
                    <div className="auth-error">
                        {errors.map((error, index) => (
                            <p key={index}>{error}</p>
                        ))}
                    </div>
                )}
                
                {successMessage && (
                    <div className="auth-success">
                        <p>{successMessage}</p>
                    </div>
                )}
                
                <form className="auth-form" onSubmit={handleSubmit}>
                    <label htmlFor="email" className="auth-label">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="auth-input"
                        placeholder="Введите ваш email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="password" className="auth-label">Пароль:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className="auth-input"
                        placeholder="Введите пароль"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Вход...' : 'Войти'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;