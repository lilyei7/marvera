import React, { useState, useEffect, useCallback } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [hasError, setHasError] = useState(false);

  // Precargar imagen actual y siguientes
  useEffect(() => {
    const preloadImages = () => {
      // Precargar imagen actual y las 2 siguientes
      const indicesToPreload = [
        currentIndex,
        (currentIndex + 1) % images.length,
        (currentIndex + 2) % images.length
      ];

      indicesToPreload.forEach(index => {
        if (!loadedImages.has(index) && images[index]) {
          const img = new Image();
          img.onload = () => {
            setLoadedImages(prev => new Set([...prev, index]));
            if (index === currentIndex) {
              setIsLoading(false);
            }
          };
          img.onerror = () => {
            if (index === currentIndex) {
              setHasError(true);
              setIsLoading(false);
            }
          };
          img.src = images[index];
        }
      });
    };

    if (images.length > 0) {
      setIsLoading(true);
      setHasError(false);
      preloadImages();
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

  if (!images || images.length === 0) {
    return (
      <div className={`relative bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">🐟</div>
          <p className="text-gray-500 text-sm">Sin imagen</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];

  return (
    <div className={`relative group ${className}`}>
      {/* Main Image Container */}
      <div className="relative w-full h-full bg-gray-100 overflow-hidden rounded-lg">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="relative">
              <div className="w-8 h-8 border-3 border-blue-200 rounded-full animate-spin border-t-primary"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-primary text-xs">🐟</span>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {hasError && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="text-3xl mb-2">🐟</div>
              <p className="text-gray-500 text-sm">Error al cargar</p>
            </div>
          </div>
        )}

        {/* Main Image */}
        <img
          src={currentImage}
          alt={`${productName} - Imagen ${currentIndex + 1}`}
          className={`w-full h-full object-cover transition-all duration-500 ${
            isLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
          } group-hover:scale-105`}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
          style={{
            filter: isLoading ? 'blur(5px)' : 'blur(0px)'
          }}
        />

        {/* Navigation Arrows - Solo si hay más de 1 imagen */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-20"
              aria-label="Imagen anterior"
            >
              <ChevronLeftIcon className="h-4 w-4 text-gray-700" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-20"
              aria-label="Imagen siguiente"
            >
              <ChevronRightIcon className="h-4 w-4 text-gray-700" />
            </button>
          </>
        )}

        {/* Counter */}
        {showCounter && images.length > 1 && (
          <div className="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium z-20">
            {currentIndex + 1}/{images.length}
          </div>
        )}

        {/* Dots Indicator */}
        {showDots && images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-white scale-125'
                    : 'bg-white/60 hover:bg-white/80'
                }`}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex space-x-2 mt-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === currentIndex
                  ? 'border-primary shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={image}
                alt={`Miniatura ${index + 1}`}
                className="w-full h-full object-cover"
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
