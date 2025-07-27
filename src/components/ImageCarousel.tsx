import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

interface ImageCarouselProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ 
  images, 
  onImagesChange, 
  maxImages = 5, 
  className = '' 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const addImage = () => {
    if (newImageUrl.trim() && images.length < maxImages) {
      onImagesChange([...images, newImageUrl.trim()]);
      setNewImageUrl('');
      setShowAddInput(false);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    if (currentIndex >= newImages.length) {
      setCurrentIndex(Math.max(0, newImages.length - 1));
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Main Image Display */}
      <div className="relative aspect-square bg-light-peach rounded-lg sm:rounded-xl overflow-hidden mb-3 sm:mb-4">
        {images.length > 0 ? (
          <>
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-light-peach to-light-beige">
              <div className="text-4xl sm:text-6xl">{images[currentIndex] || '🐟'}</div>
            </div>
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-deep-navy rounded-full p-1.5 sm:p-2 transition-all duration-200 hover:scale-110"
                >
                  <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-deep-navy rounded-full p-1.5 sm:p-2 transition-all duration-200 hover:scale-110"
                >
                  <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {currentIndex + 1}/{images.length}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-2">📷</div>
              <p className="text-xs sm:text-sm">Sin imágenes</p>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="flex items-center gap-2 mb-3 sm:mb-4 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <div
            key={index}
            className={`relative flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-md border-2 cursor-pointer transition-all duration-200 ${
              index === currentIndex 
                ? 'border-vibrant-blue shadow-lg' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setCurrentIndex(index)}
          >
            <div className="w-full h-full flex items-center justify-center bg-light-peach rounded-sm text-lg sm:text-xl">
              {image || '🐟'}
            </div>
            
            {/* Remove button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeImage(index);
              }}
              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 text-xs transition-colors duration-200"
            >
              <XMarkIcon className="h-3 w-3" />
            </button>
          </div>
        ))}

        {/* Add Image Button */}
        {images.length < maxImages && (
          <button
            onClick={() => setShowAddInput(true)}
            className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 border-2 border-dashed border-gray-300 hover:border-vibrant-blue rounded-md flex items-center justify-center text-gray-400 hover:text-vibrant-blue transition-all duration-200 hover:bg-light-peach/50"
          >
            <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        )}
      </div>

      {/* Add Image Input */}
      {showAddInput && (
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            placeholder="🐟 Emoji del producto"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-vibrant-blue focus:border-vibrant-blue text-sm"
            onKeyPress={(e) => e.key === 'Enter' && addImage()}
          />
          <button
            onClick={addImage}
            className="bg-vibrant-blue hover:bg-dark-blue text-white px-3 py-2 rounded-md transition-colors duration-200 text-sm"
          >
            Añadir
          </button>
          <button
            onClick={() => {
              setShowAddInput(false);
              setNewImageUrl('');
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-md transition-colors duration-200 text-sm"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Image URLs List */}
      {images.length > 0 && (
        <div className="mt-3">
          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">URLs de Imágenes:</p>
          <div className="space-y-1">
            {images.map((image, index) => (
              <div key={index} className="flex items-center gap-2 text-xs bg-gray-50 p-2 rounded">
                <span className="text-lg">{image}</span>
                <span className="text-gray-500 flex-1 truncate">Imagen {index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
