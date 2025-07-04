import { useState } from 'react';

// Кастомный хук для логики регистрации
const useRegistration = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');

    const register = async (formData) => {
        setIsLoading(true);
        setErrors([]); // Очищаем предыдущие ошибки перед новым запросом
        setSuccessMessage(''); // Очищаем предыдущее сообщение об успехе

        const url = 'http://localhost:8000/registration.php';

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    register: true // Флаг регистрации
                })
            });

            const data = await response.json();

            if (data.errors && data.errors.length > 0) {
                setErrors(data.errors);
                setSuccessMessage('');
                // Возвращаем результат, чтобы компонент мог отреагировать (например, не очищать форму)
                return { success: false, errors: data.errors };
            } else if (response.ok) {
                setSuccessMessage(data.message || 'Регистрация прошла успешно!');
                setErrors([]);
                 // Возвращаем результат
                return { success: true, message: data.message || 'Регистрация прошла успешно!' };
            } else {
                 setErrors([data.message || 'Произошла ошибка при регистрации.']);
                 setSuccessMessage('');
                 // Возвращаем результат
                 return { success: false, errors: [data.message || 'Произошла ошибка при регистрации.'] };
            }

        } catch (error) {
            console.error("Fetch или JSON ошибка:", error);
             setErrors(['Ошибка соединения или обработки данных: ' + error.message]);
             setSuccessMessage('');
             // Возвращаем результат
             return { success: false, errors: ['Ошибка соединения или обработки данных: ' + error.message] };
        } finally {
            setIsLoading(false);
        }
    };

    // Хук возвращает состояние и функцию для запуска регистрации
    return {
        register,
        isLoading,
        errors,
        successMessage,
        // Также можно добавить функции для сброса состояния, если нужно
        resetState: () => {
            setIsLoading(false);
            setErrors([]);
            setSuccessMessage('');
        }
    };
};

export default useRegistration;