import React, { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackImage?: string;
  fallbackEmoji?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackImage,
  fallbackEmoji = '🐟',
  priority = false,
  onLoad,
  onError,
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isAttemptingFallback, setIsAttemptingFallback] = useState(false);

  useEffect(() => {
    if (!src) {
      setHasError(true);
      setIsLoaded(false);
      return;
    }

    // Reset states
    setIsLoaded(false);
    setHasError(false);
    setImageSrc('');
    setIsAttemptingFallback(false);

    // Función para cargar imagen
    const loadImage = (imageUrl: string, isFallback: boolean = false) => {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(imageUrl);
        setIsLoaded(true);
        setHasError(false);
        if (!isFallback) {
          onLoad?.();
        }
      };
      
      img.onerror = () => {
        if (!isFallback && fallbackImage && !isAttemptingFallback) {
          setIsAttemptingFallback(true);
          loadImage(fallbackImage, true);
        } else {
          setHasError(true);
          setIsLoaded(false);
          onError?.();
        }
      };

      // Forzar la carga inmediata
      img.src = imageUrl;
      
      // Si es prioritaria, también forzar la carga en el DOM
      if (priority && !isFallback) {
        img.crossOrigin = 'anonymous';
        img.loading = 'eager';
      }
    };

    loadImage(src);
  }, [src, fallbackImage, priority, onLoad, onError, isAttemptingFallback]);

  // Si hay error y no hay imagen cargada, mostrar emoji
  if (hasError && !isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 ${className}`}>
        <div className="text-center">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-2 animate-pulse">
            {fallbackEmoji}
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Imagen no disponible
          </div>
        </div>
      </div>
    );
  }

  // Estados de carga
  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-2"></div>
          <div className="text-xs text-gray-500 font-medium">
            Cargando...
          </div>
        </div>
      </div>
    );
  }

  // Imagen cargada exitosamente
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={imageSrc}
        alt={alt}
        className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
        loading={priority ? 'eager' : 'lazy'}
        style={{
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)', // Forzar aceleración por hardware
        }}
      />
    </div>
  );
};

export default OptimizedImage;
