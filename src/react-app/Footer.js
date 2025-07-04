import React from 'react';
import '../css/Footer.css'; // Стили для футера

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-links">
          <div className="footer-column">
            <a href="/privacy-policy">Политика конфиденциальности</a>
            <a href="/user-agreement">Пользовательское соглашение</a>
          </div>
          <div className="footer-column">
            <a href="/offer">Оферта</a>
          </div>
        </div>   
        <div className="footer-auth">
          <a href="/login">Вход в личный кабинет</a>
        </div>
      </div>
      
      <div className="footer-copyright">
        <p>© Афродита, 2025 - {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
};

export default Footer;