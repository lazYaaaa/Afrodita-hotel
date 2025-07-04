import React, { useState } from 'react';

const Registration = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirm_password: ''
    });
    const [errors, setErrors] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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
        setSuccessMessage('');

        try {
            const response = await fetch('http://localhost:8000/registration.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    register: true
                })
            });

            const data = await response.json();

            // Сначала проверяем наличие ошибок в ответе
            if (data.errors && data.errors.length > 0) {
                setErrors(data.errors);
                return;
            }

            // Затем проверяем статус ответа
            if (!response.ok) {
                setErrors(['Произошла ошибка при регистрации']);
                return;
            }

            // Только если нет ошибок и статус успешный
            setSuccessMessage(data.message || 'Регистрация прошла успешно!');
            setFormData({
                username: '',
                email: '',
                password: '',
                confirm_password: ''
            });

        } catch (error) {
            setErrors(['Ошибка соединения с сервером']);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Регистрация</h2>
                
                {errors.length > 0 && (
                    <div className="auth-error">
                        {errors.map((error, index) => (
                            <p key={index}>{error}</p>
                        ))}
                    </div>
                )}
                
                {successMessage && errors.length === 0 && (
                    <div className="auth-success">
                        <p>{successMessage}</p>
                    </div>
                )}
                
                <form className="auth-form" onSubmit={handleSubmit}>
                    <label htmlFor="username" className="auth-label">Имя пользователя:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        className="auth-input"
                        placeholder="Только буквы, цифры и _"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />

                    <label htmlFor="email" className="auth-label">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="auth-input"
                        placeholder="example@domain.com"
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
                        placeholder="Не менее 8 символов"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength="8"
                    />

                    <label htmlFor="confirm_password" className="auth-label">Подтвердите пароль:</label>
                    <input
                        type="password"
                        id="confirm_password"
                        name="confirm_password"
                        className="auth-input"
                        placeholder="Повторите пароль"
                        value={formData.confirm_password}
                        onChange={handleChange}
                        required
                    />

                    <button 
                        type="submit" 
                        className="registration-button"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Registration;