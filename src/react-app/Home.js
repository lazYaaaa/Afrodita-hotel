import React, { useState } from "react";
import RoomList from "./RoomList";
import PhotoGallery from "./mainGallery";
import { rooms as initialRooms } from './rooms';
import GuestHouseInfo from "./bottomDescription";

// Принимаем данные пользователя как проп
const Home = ({ user }) => {
    const [rooms, ] = useState(initialRooms);

    // Определяем имя для отображения
    const displayUsername = user ? user.username : 'Гость';

    return (
        <div className="home">
            <div className="greeting">
                <h3>Добро пожаловать, {displayUsername}!</h3> {/* Используем displayUsername */}
            </div>
            <PhotoGallery />
            <RoomList rooms={rooms} title={"Номера"} />
            <GuestHouseInfo/>
        </div>
    );
}

export default Home;