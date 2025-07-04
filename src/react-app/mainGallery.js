import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import '../css/PhotoGallery.css';

const importAll = (r) => r.keys().map(r);

const getImagesContext = (galleryName) => {
  const cleanName = galleryName.replace('../', '');
  switch(cleanName) {
    case 'room2': return require.context('../roomImgs/room2', false, /\.(png|jpe?g|svg)$/);
    case 'room1': return require.context('../roomImgs/room1', false, /\.(png|jpe?g|svg)$/);
    case 'room3': return require.context('../roomImgs/room3', false, /\.(png|jpe?g|svg)$/);
    case 'room4': return require.context('../roomImgs/room4', false, /\.(png|jpe?g|svg)$/);
    default: return require.context('../mainGallery', false, /\.(png|jpe?g|svg)$/);
  }
};

const PhotoGallery = ({ galleryName = 'mainGallery', containerRef }) => {
  const images = importAll(getImagesContext(galleryName));
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const slideshowIntervalRef = useRef(null);
  const modalRef = useRef(null);
  
  const [visibleImages, setVisibleImages] = useState(
    galleryName === 'mainGallery' ? Math.min(8, images.length) : Math.min(3, images.length)
  );

  // Функция для рендера модального окна в portal
  const renderModal = () => {
    if (!isModalOpen) return null;
    
    return ReactDOM.createPortal(
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" ref={modalRef} onClick={(e) => e.stopPropagation()}>
          <div className="image-container">
  <img
    src={images[currentIndex]}
    alt={`Комната ${currentIndex + 1}`}
    className="modal-image"
    style={{ transform: `scale(${zoomLevel})` }}
  />
</div>
          
          <div className="modal-controls">
            <button className="nav-button prev-button" onClick={showPrev}>
              ←
            </button>
            
            <div className="zoom-controls">
              <button onClick={zoomIn} title="Zoom In">+</button>
              <button onClick={zoomOut} title="Zoom Out">-</button>
            </div>
            
            <button className="nav-button next-button" onClick={showNext}>
              →
            </button>
          </div>
          
          <div className="secondary-controls">
            <button 
              className={`slideshow-button ${isSlideshowActive ? 'active' : ''}`} 
              onClick={toggleSlideshow}
            >
              {isSlideshowActive ? '⏸️ Стоп' : '▶️ Слайд-шоу'}
            </button>
            
            <button className="close-button" onClick={closeModal}>
              ✕ Закрыть
            </button>
          </div>
          
          <div className="image-counter">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </div>,
      document.body
    );
  };

  const showNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % images.length);
    setZoomLevel(1);
  }, [images.length]);

  const showPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
    setZoomLevel(1);
  }, [images.length]);

  useEffect(() => {
    if (isSlideshowActive) {
      slideshowIntervalRef.current = setInterval(showNext, 3000);
    } else {
      clearInterval(slideshowIntervalRef.current);
    }
    
    return () => {
      clearInterval(slideshowIntervalRef.current);
    };
  }, [isSlideshowActive, showNext]);

  const openModal = useCallback((index) => {
    setCurrentIndex(index);
    setModalOpen(true);
    setZoomLevel(1);
    setIsSlideshowActive(false);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setIsSlideshowActive(false);
  }, []);

  const toggleSlideshow = useCallback(() => {
    setIsSlideshowActive(prev => !prev);
  }, []);

  const zoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  }, []);

  const loadMoreImages = useCallback((e) => {
    e.stopPropagation();
    setVisibleImages(images.length);
  }, [images.length]);

  useEffect(() => {
  const handleKeyDown = (e) => {
    if (!isModalOpen) return;

    switch (e.key) {
      case 'Escape':
        closeModal();
        break;
      case 'ArrowLeft':
        showPrev();
        break;
      case 'ArrowRight':
        showNext();
        break;
      default:
        break;
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}, [isModalOpen, closeModal, showPrev, showNext]);

  return (
    <div className="portfolio-gallery">
      {galleryName === 'mainGallery' && (
        <h2 className="gallery-title">Гостевой дом "Афродита"</h2>
      )}
      
      <div className="gallery-container">
        {images.slice(0, visibleImages).map((src, index) => (
          <div key={index} className="thumbnail-container">
            <img
              src={src}
              alt={`Комната ${index + 1}`}
              className="thumbnail"
              loading="lazy"
              onClick={() => openModal(index)}
            />
            {index === visibleImages - 1 && images.length > visibleImages && (
              <div 
                className="remaining-count" 
                onClick={loadMoreImages}
              >
                +{images.length - visibleImages}
              </div>
            )}
          </div>
        ))}
      </div>

      {renderModal()}
    </div>
  );
};

export default PhotoGallery;