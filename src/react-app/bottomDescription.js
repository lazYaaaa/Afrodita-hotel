import React from 'react';
import { FaSwimmingPool, FaCar, FaWifi, FaTree, FaChild, FaDog, FaBaby, FaClock, FaUtensils, FaShuttleVan, FaTshirt, FaMoneyBillWave, FaCamera, FaComment } from 'react-icons/fa';
import '../css/bottomDescription.css'
const GuestHouseInfo = () => {
  return (
    <div className="guest-house-container">
      
      <div className="info-section">
        <h2><FaSwimmingPool /> Удобства</h2>
        <div className="amenities-grid">
          <div className="amenity-item">
            <FaSwimmingPool className="icon" />
            <span>Бассейн</span>
          </div>
          <div className="amenity-item">
            <FaCar className="icon" />
            <span>Автостоянка</span>
          </div>
          <div className="amenity-item">
            <FaWifi className="icon" />
            <span>Интернет Wi-Fi</span>
          </div>
          <div className="amenity-item">
            <FaTree className="icon" />
            <span>Территория, двор</span>
          </div>
          <div className="amenity-item">
            <FaChild className="icon" />
            <span>Детская площадка</span>
          </div>
          <div className="amenity-item">
            <FaDog className="icon" />
            <span>Проживание с животными</span>
          </div>
          <div className="amenity-item">
            <FaBaby className="icon" />
            <span>Дети любого возраста</span>
          </div>
          <div className="amenity-item">
            <FaClock className="icon" />
            <span>Круглосуточная регистрация</span>
          </div>
        </div>
      </div>
      
      <div className="info-section">
        <h2><FaUtensils /> Описание</h2>
        <p>
          Гостевой дом "Афродита" находится в районе Голубой бухты города-курорта Геленджик, 
          в 10 минутах ходьбы от моря. Путь к морю через сосновую рощу. Тихое место для 
          полноценного отдыха. Для гостей восемь комфортабельных номеров. Также имеется кухня, 
          оборудованная всем необходимым, мангал, стиральная машинка. На территории бассейн 
          с подогревом (4 м*8 м) Для детей батут и детская площадка. Территория гостевого 
          дома утопает в зелени и цветах. Есть места для отдыха, мангальная зона, детская 
          площадка, бассейн с подогревом, батут 3м.
        </p>
        <p><strong>Автостоянка:</strong> перед зданием (бесплатно)</p>
        <p><strong>Питание:</strong> самостоятельное</p>
      </div>
      
      <div className="info-section">
        <h2><FaShuttleVan /> Доп. услуги</h2>
        <ul>
          <li>Организация трансфера</li>
          <li>Стиральная машина автомат (платно)</li>
        </ul>
      </div>
      
      <div className="info-section">
        <h2><FaMoneyBillWave /> Принцип предоплаты</h2>
        <p>
          Для гарантированного бронирования номера необходима предоплата в размере стоимости 
          одних суток проживания на карту Сбербанка.
        </p>
        <p><strong>Расчетный час:</strong> выезд до 10:00; заезд с 12:00</p>
      </div>
      
      <div className="info-section">
        <h2><FaCamera /> Фотографии гостей</h2>
        {/* Здесь можно добавить компонент галереи */}
      </div>
      
      <div className="info-section">
        <h2><FaComment /> Отзывы гостей</h2>
        {/* Здесь можно добавить компонент отзывов */}
      </div>
    </div>
  );
};

export default GuestHouseInfo;