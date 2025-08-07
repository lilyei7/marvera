import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ProductImageViewerProps {
  images: string[];
  productName: string;
  className?: string;
  showDots?: boolean;
  showCounter?: boolean;
  showThumbnails?: boolean;
  size?: 'thumb' | 'medium' | 'large' | 'original';
}

const ProductImageViewer: React.FC<ProductImageViewerProps> = ({
  images,
  productName,
  className = "",
  showDots = true,
  showCounter = true,
  showThumbnails = false,
  // size = 'medium' // Para futuras optimizaciones
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [hasError, setHasError] = useState(false);
  
  // Estados para swipe táctil
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Distancia mínima para considerar un swipe
  const minSwipeDistance = 50;

  // Gestión simple de carga de imagen actual
  useEffect(() => {
    if (!images || images.length === 0) return;
    
    const currentImage = images[currentIndex];
    if (!currentImage) return;

    // Solo mostrar loading si la imagen actual no está cargada
    if (!loadedImages.has(currentIndex)) {
      setIsLoading(true);
      setHasError(false);
      
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, currentIndex]));
        setIsLoading(false);
        setHasError(false);
      };
      img.onerror = () => {
        setHasError(true);
        setIsLoading(false);
      };
      img.src = currentImage;
    } else {
      // La imagen ya está cargada, no mostrar loading
      setIsLoading(false);
      setHasError(false);
    }
  }, [currentIndex, images, loadedImages]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Funciones para manejar swipe táctil
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null); // Reset touchEnd
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && images.length > 1) {
      goToNext();
    }
    if (isRightSwipe && images.length > 1) {
      goToPrevious();
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className={`relative bg-gray-50 flex items-center justify-center ${className}`}>
        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-gray-400 rounded opacity-50"></div>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className={`relative group ${className} swipeable`} style={{ WebkitTapHighlightColor: 'transparent' }}>
      {/* Main Image Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-full bg-gray-100 overflow-hidden rounded-lg touch-manipulation image-swipe"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Loading Spinner - sin emoji */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="w-8 h-8 border-2 border-gray-200 rounded-full animate-spin border-t-primary"></div>
          </div>
        )}

        {/* Error State - sin emoji */}
        {hasError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-400 rounded opacity-50"></div>
            </div>
          </div>
        )}

        {/* Main Image - Cambio a object-contain para ver imagen completa - MEJORADO */}
        <img
          src={currentImage}
          alt={`${productName} - Imagen ${currentIndex + 1}`}
          className={`w-full h-full object-contain transition-all duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          } group-hover:scale-105`}
          loading="lazy"
          style={{
            filter: isLoading ? 'blur(2px)' : 'blur(0px)'
          }}
        />

        {/* Navigation Arrows - Solo si hay más de 1 imagen con mejor táctil */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-4 sm:p-3 md:p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 touch-manipulation active:bg-white/70"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label="Imagen anterior"
            >
              <ChevronLeftIcon className="h-6 w-6 sm:h-5 sm:w-5 md:h-4 md:w-4 text-gray-700" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-4 sm:p-3 md:p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 touch-manipulation active:bg-white/70"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              aria-label="Imagen siguiente"
            >
              <ChevronRightIcon className="h-6 w-6 sm:h-5 sm:w-5 md:h-4 md:w-4 text-gray-700" />
            </button>
          </>
        )}

        {/* Counter con indicación de swipe */}
        {showCounter && images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/70 text-white px-4 py-2 xs:px-3 xs:py-1 rounded-full text-base xs:text-sm font-medium z-20 flex items-center space-x-1">
            <span>{currentIndex + 1}/{images.length}</span>
            <span className="text-sm xs:text-xs opacity-75 hidden xs:inline">• Desliza</span>
          </div>
        )}

        {/* Dots Indicator - Mejorados para táctil */}
        {showDots && images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-3 xs:space-x-2 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(index);
                }}
                className={`w-4 h-4 xs:w-3 xs:h-3 sm:w-2 sm:h-2 rounded-full transition-all duration-200 touch-manipulation ${
                  index === currentIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/60 hover:bg-white/80'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails - Con mejor táctil */}
      {showThumbnails && images.length > 1 && (
        <div className="flex space-x-2 xs:space-x-1.5 mt-3 xs:mt-2 overflow-x-auto pb-2 xs:pb-1 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 w-18 h-18 xs:w-16 xs:h-16 sm:w-14 sm:h-14 rounded-lg xs:rounded-md overflow-hidden border-2 transition-all duration-200 touch-manipulation ${
                index === currentIndex
                  ? 'border-primary shadow-md scale-105'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <img
                src={image}
                alt={`Miniatura ${index + 1}`}
                className="w-full h-full object-contain p-0.5"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageViewer;
