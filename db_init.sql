CREATE DATABASE afrodita;
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE, -- Поле для определения администратора
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    email VARCHAR(255) NOT NULL,
    room_id INTEGER REFERENCES rooms(id),  
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    adults INTEGER NOT NULL,
    children INTEGER NOT NULL DEFAULT 0,
    phone VARCHAR(50) NOT NULL,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cost INTEGER NOT NULL,
    capacity INTEGER NOT NULL
);
SELECT * FROM rooms
SELECT * FROM bookings;
SELECT * FROM users
DELETE FROM bookings;

ALTER TABLE bookings 
ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'pending';








