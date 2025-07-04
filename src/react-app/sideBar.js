/* global ymaps */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import map from '../static_map.png';


const YANDEX_MAPS_API_KEY = '1bb8a662-10f0-4e47-8bd3-e5930dc323f3'; 

const SideBar = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isExpanded, setIsExpanded] = useState(false);
  // showInteractiveMap: false - показываем статическую, true - показываем интерактивную
  const [showInteractiveMap, setShowInteractiveMap] = useState(false);
  const mapRef = useRef(null); // Ссылка на DOM элемент для карты
  const mapInstanceRef = useRef(null); // Ссылка на экземпляр объекта карты Яндекс

  // Оборачиваем координаты в useMemo для стабильности
  const locationCoords = useMemo(() => [44.579082, 37.987768], []); // Широта, Долгота

  // URL для Static API Яндекс.Карт. Используем locationCoords (долгота, широта для ll и pt)
  //const staticMapImageUrl = `https://static-maps.yandex.ru/1.x/?lang=ru_RU&ll=${locationCoords[1]},${locationCoords[0]}&z=14&l=map&size=400,200&pt=${locationCoords[1]},${locationCoords[0]},pmdom&apikey=${YANDEX_MAPS_API_KEY}`;

  // Эффект для обработки изменения размера окна (для мобильного меню)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      // Если окно становится больше мобильного, схлопываем сайдбар
      if (window.innerWidth > 768) {
          setIsExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Пустой массив зависимостей означает, что эффект выполняется один раз при монтировании и очищается при размонтировании

  // Эффект для загрузки скрипта API и инициализации интерактивной карты
  useEffect(() => {
    // Инициализируем карту только если showInteractiveMap равно true,
    // контейнер доступен (mapRef.current) и карта еще не инициализирована (mapInstanceRef.current)
    if (showInteractiveMap && mapRef.current && !mapInstanceRef.current) {
      // Проверяем, загружен ли скрипт API Яндекс.Карт
      if (typeof ymaps === 'undefined' || !ymaps.ready) {
        // Если не загружен или не готов, создаем и добавляем скрипт в head
        const script = document.createElement('script');
        // Добавляем параметр onload для вызова функции после загрузки скрипта
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_MAPS_API_KEY}&lang=ru_RU&onload=initYandexMap`;
        script.type = 'text/javascript';
        document.head.appendChild(script);

        // Определяем глобальную функцию, которая будет вызвана после загрузки скрипта
        window.initYandexMap = () => {
            // Проверяем еще раз условия, чтобы избежать повторной инициализации
            if (mapRef.current && !mapInstanceRef.current) {
                 ymaps.ready(() => {
                     // Создаем экземпляр карты
                     mapInstanceRef.current = new ymaps.Map(mapRef.current, {
                         center: locationCoords, // Центрируем по нашим координатам
                         zoom: 15, // Устанавливаем масштаб
                     }, {
                        // Опции поведения, если нужно (например, отключить зум колесиком)
                        // behaviors: ['drag']
                     });

                     // Добавляем метку на карту
                     const placemark = new ymaps.Placemark(locationCoords, {
                        // content: 'Здесь мы находимся!', // Всплывающий контент метки
                        // balloonContent: 'Это наша точка на карте' // Контент балуна метки
                     });
                     mapInstanceRef.current.geoObjects.add(placemark);

                     // Возможно, потребуется принудительно обновить размер карты, если она была скрыта
                     if (mapInstanceRef.current.container.getParentElement().offsetWidth > 0) {
                         mapInstanceRef.current.container.fitToViewport();
                     }
                 });
            }
            // Удаляем глобальную функцию после ее вызова
            delete window.initYandexMap;
        };

      } else {
        // Если скрипт уже загружен и готов
        ymaps.ready(() => {
            if (mapRef.current && !mapInstanceRef.current) {
                 mapInstanceRef.current = new ymaps.Map(mapRef.current, {
                     center: locationCoords,
                     zoom: 15,
                 }, {
                    // behaviors: ['drag']
                 });

                 const placemark = new ymaps.Placemark(locationCoords, {});
                 mapInstanceRef.current.geoObjects.add(placemark);

                 if (mapInstanceRef.current.container.getParentElement().offsetWidth > 0) {
                     mapInstanceRef.current.container.fitToViewport();
                 }
            }
        });
      }
    }

    // Cleanup function: удаляем карту при размонтировании компонента или при изменении showInteractiveMap на false
    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.destroy();
            mapInstanceRef.current = null;
        }
    };

  }, [showInteractiveMap, locationCoords]); // Удален YANDEX_MAPS_API_KEY из зависимостей

  // Функция, вызываемая при клике на статическое изображение карты
  const handleStaticMapClick = () => {
    // При клике на статическую карту, скрываем ее и показываем интерактивную
    setShowInteractiveMap(true);
  };

  return (
    <>
      {/* Кнопка для мобильных (скрывается на десктопе) */}
      {isMobile && (
        <button
          className="sidebar-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? '✕' : 'Контакты'}
        </button>
      )}

      {/* Основной сайдбар */}
      {/* Класс 'expanded' добавляется на десктопе или при isExpanded на мобильных */}
      <div className={`sidebar ${isMobile ? 'mobile' : ''} ${isExpanded || !isMobile ? 'expanded' : ''}`}>
        <div className="sidebar-content">
          <h2>Оценка гостей</h2>
          {/* Добавьте сюда контент с оценками гостей */}

          <div className="contacts-section">
            <h3>Прямые контакты:</h3>

            <div className="contact-item">
              <h4>Екатерина</h4>
              <a href="tel:+79015193362">+7 (901) 519-33-62</a>
            </div>

            <div className="contact-item">
              <h4>Николай</h4>
              <a href="tel:+79015782303">+7 (901) 578-23-03</a>
            </div>
          </div>

          <div className="divider"></div> {/* Разделитель */}

          <div className="address">
            <strong>Геленджик</strong>
            <p>Голубая бухта, ул. Дмитрия Сабинина, 23</p>

            {/* Контейнер для карты */}
            <div className="map-container"> {/* Класс map-container из MapStyles.css */}

              {/* Отображаем статическую карту, если showInteractiveMap false */}
              {!showInteractiveMap && (
                <img
                  src={map}
                  alt="Карта расположения"
                  className="static-map-image" 
                  onClick={handleStaticMapClick} // Обработчик клика по статической карте
                />
              )}

              {/* Отображаем контейнер для интерактивной карты, если showInteractiveMap true */}
              <div
                ref={mapRef}
                className="interactive-map" // Класс interactive-map из MapStyles.css
                style={{ display: showInteractiveMap ? 'block' : 'none' }}
              >
                {/* Интерактивная карта Яндекс будет инициализирована здесь */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBar;