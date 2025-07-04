import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../LOGO.png';

const Navbar = ({ user, onLogout }) => {
    return (
        <nav className="navbar">
            <Link to="/">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img 
                        src={logo} 
                        alt="Логотип" 
                        style={{ height: '70px', marginRight: '10px' }} 
                    />
                    <h1>Афродита</h1>
    </div>
            </Link>
            <div className="links">
                {user ? (
                    // Если пользователь вошёл (user не null)
                    <>  
                        
                        {user.is_admin && (
                            <Link to="/admin/bookings" className="nav-link">
                                Заявки
                            </Link>
                        )}
                        {!user.is_admin && (<Link to="/my-bookings" className="nav-link">
                            Мои заявки
                        </Link>)}
                        <button onClick={onLogout} className="logout-button">
                            Выход
                        </button>
                    </>
                ) : (
                    // Если пользователь не вошёл (user null)
                    <>
                        <Link to="/registration" className="login-link">Регистрация</Link>
                        <Link to="/login" className="login-link">
                            Вход
                        </Link>
                        
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;