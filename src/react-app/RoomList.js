import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import PhotoGallery from './mainGallery';
import * as Icons from 'react-icons/fa';

const RoomsList = ({ rooms, title }) => {
    const [expandedRoomId, setExpandedRoomId] = useState(null);
    const toggleDetails = (roomId) => {
        setExpandedRoomId(expandedRoomId === roomId ? null : roomId);
    };

    // Функция для получения компонента иконки
    const getIconComponent = (iconName) => {
        return Icons[iconName] || Icons.FaQuestionCircle;
    };

    return (
        <div className="rooms-container">
            <h3>{title}</h3>
            {rooms.map((room) => (
                <div className="room-preview" key={room.id}>
                    {/* Галерея превью */}
                    <PhotoGallery galleryName={`room${room.id + 1}`} />
                    
                    <h2>{room.title}</h2>
                    <div className="room-price-container">
                        <span className="room-price">{room.cost} ₽</span>
                        <span className="price-description"> / за номер в сутки</span>
                        {room.details?.capacity?.text && (
                            <span className="room-capacity"> (вместимость: {room.details.capacity.text})</span>
                        )}
                    </div>
                    
                    <div className="room-actions">
                        <button
                            className={`details-button ${expandedRoomId === room.id ? 'expanded' : ''}`}
                            onClick={() => toggleDetails(room.id)}
                        >
                            {expandedRoomId === room.id ? 'Скрыть подробности' : 'Подробнее'}
                            <span className="details-arrow">
                                {expandedRoomId === room.id ? '▲' : '▼'}
                            </span>
                        </button>

                        <Link to={`/book/${room.id}`}>
                            <button className="book-button">
                                Забронировать
                            </button>
                        </Link>
                    </div>

                    {expandedRoomId === room.id && (
                        <div className="room-details">
                            <div className="details-section">
                                <h4>Удобства</h4>
                                <ul className="amenities-list">
                                    {room.amenities?.map((item, index) => {
                                        const Icon = item.icon?.component ? item.icon.component : getIconComponent(item.icon);
                                        return (
                                            <li key={index}>
                                                <Icon className="amenity-icon" />
                                                {item.text}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            <div className="details-section">
                                <h4>Описание</h4>
                                <p>{room.description}</p>
                                <div className="room-rules">
                                    <h5>Условия:</h5>
                                    <ul>
                                        {room.rules?.map((rule, index) => (
                                            <li key={index}>{rule}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="details-section">
                                <h4>Мебель</h4>
                                {room.details?.beds?.icon && (
                                    <div className="detail-with-icon">
                                        {React.createElement(
                                            room.details.beds.icon.component || getIconComponent(room.details.beds.icon),
                                            { className: 'detail-icon' }
                                        )}
                                        <span>{room.details.beds.text}</span>
                                    </div>
                                )}
                                <p>{room.details?.furniture || 'Прикроватные тумбочки, шкаф, стол, стулья'}</p>
                            </div>

                            <div className="details-section">
                                <h4>Характеристики</h4>
                                <ul className="features-list">
                                    <li>
                                        <input type="checkbox" checked readOnly /> 
                                        Комнат: 1
                                    </li>
                                    <li>
                                        <input type="checkbox" checked readOnly /> 
                                        Этаж: {room.details?.floor || 2}
                                    </li>
                                    <li>
                                        <input type="checkbox" checked readOnly /> 
                                        Площадь: {room.details?.area || '18'}м²
                                    </li>
                                    {room.details?.kitchen && (
                                        <li>
                                            <input type="checkbox" checked readOnly /> 
                                            Кухня: {room.details.kitchen.text || room.details.kitchen}
                                        </li>
                                    )}
                                    {room.details?.bathroom && (
                                        <li>
                                            <input type="checkbox" checked readOnly /> 
                                            Санузел: {room.details.bathroom.text || room.details.bathroom}
                                        </li>
                                    )}
                                </ul>
                            </div>

                            <div className="details-section">
                                <h4>Цены</h4>
                                <table className="price-table">
                                    <thead>
                                        <tr>
                                            <th>Период</th>
                                            <th>Цена</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {room.prices?.map((price, index) => (
                                            <tr key={index}>
                                                <td>{price.period}</td>
                                                <td><strong>{price.price} ₽</strong></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default RoomsList;