import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ProductImageViewerProps {
  images: string[];
  productName: string;
  className?: string;
  showDots?: boolean;
  showCounter?: boolean;
  showThumbnails?: boolean;
}

const ProductImageViewer: React.FC<ProductImageViewerProps> = ({
  images,
  productName,
  className = "",
  showDots = true,
  showCounter = true,
  showThumbnails = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // API base URL para construir URLs completas
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  if (!images || images.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-light-peach to-light-beige flex items-center justify-center ${className}`}>
        <span className="text-4xl">🐟</span>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0); // Reset touchEnd
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && images.length > 1) {
      goToNext();
    }
    if (isRightSwipe && images.length > 1) {
      goToPrevious();
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const getImageSrc = (image: string) => {
    if (image.startsWith('http')) return image;
    if (image.startsWith('/uploads')) return `${API_BASE_URL}${image}`;
    return image; // Para emojis
  };

  const renderImage = (image: string, index: number) => {
    const isUrl = isValidUrl(image) || image.startsWith('/uploads');
    const isEmoji = !isUrl && image.length <= 4;

    if (isUrl) {
      return (
        <img
          key={index}
          src={getImageSrc(image)}
          alt={`${productName} - Imagen ${index + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/400x300/4d82bc/FFFFFF?text=🐟';
          }}
        />
      );
    } else if (isEmoji) {
      return (
        <div key={index} className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
          <span className="text-8xl">{image}</span>
        </div>
      );
    } else {
      return (
        <div key={index} className="w-full h-full flex items-center justify-center bg-gray-100">
          <span className="text-gray-500 text-center p-4">{image}</span>
        </div>
      );
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Imagen principal */}
      <div 
        className="relative overflow-hidden carousel-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {renderImage(images[currentIndex], currentIndex)}
        
        {/* Botones de navegación - solo si hay más de una imagen */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="carousel-button absolute left-1 sm:left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1.5 sm:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70 z-10"
            >
              <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <button
              onClick={goToNext}
              className="carousel-button absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1.5 sm:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70 z-10"
            >
              <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </>
        )}

        {/* Contador de imágenes */}
        {showCounter && images.length > 1 && (
          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-black/50 text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full z-10">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Dots indicadores */}
      {showDots && images.length > 1 && (
        <div className="flex justify-center mt-1.5 sm:mt-2 space-x-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors duration-200 ${
                index === currentIndex
                  ? 'bg-blue-600'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Miniaturas (thumbnails) - para pantallas más grandes */}
      {showThumbnails && images.length > 1 && (
        <div className="hidden lg:flex mt-3 sm:mt-4 space-x-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex
                  ? 'border-blue-600 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {renderImage(image, index)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageViewer;
