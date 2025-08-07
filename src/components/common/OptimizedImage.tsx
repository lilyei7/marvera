import React, { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackImage?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  size?: 'thumb' | 'medium' | 'large' | 'original';
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  fallbackImage,
  priority = false,
  onLoad,
  onError,
  size = 'medium',
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isAttemptingFallback, setIsAttemptingFallback] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Imagen prioritaria siempre visible

  // Hook para intersection observer (lazy loading inteligente)
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Si es prioritaria, cargar inmediatamente
    if (priority) {
      setIsInView(true);
      return;
    }

    // Para imágenes no prioritarias, usar intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect(); // Dejar de observar una vez que se ve
          }
        });
      },
      {
        rootMargin: '50px', // Cargar cuando esté 50px antes de ser visible
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // Función para optimizar la URL de imagen basada en el tamaño requerido
  const getOptimizedImageUrl = (originalSrc: string, targetSize: string): string => {
    if (!originalSrc) return '';
    
    // Si ya es una URL optimizada (.webp), usar tal como está
    if (originalSrc.includes('.webp')) {
      return originalSrc;
    }
    
    // Si es una URL de nuestro sistema, generar versión optimizada
    if (originalSrc.includes('/uploads/branches/')) {
      const baseName = originalSrc.replace(/\.[^/.]+$/, '').replace(/_(thumb|medium|large|original)$/, '');
      return `${baseName}_${targetSize}.webp`;
    }
    
    // Para URLs externas, usar tal como están
    return originalSrc;
  };

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

    // Solo cargar la imagen si está en vista o es prioritaria
    if (!isInView && !priority) {
      return;
    }

    // Función para cargar imagen con el tamaño optimizado
    const loadImage = (imageUrl: string, isFallback: boolean = false) => {
      try {
        // Obtener URL optimizada para el tamaño requerido
        const optimizedUrl = isFallback ? imageUrl : getOptimizedImageUrl(imageUrl, size);
        
        // Check if URL is valid
        new URL(optimizedUrl, window.location.origin);
        
        const img = new Image();
        
        img.onload = () => {
          setImageSrc(optimizedUrl);
          setIsLoaded(true);
          setHasError(false);
          if (!isFallback) {
            onLoad?.();
          }
        };
        
        img.onerror = () => {
          // Si falla la imagen optimizada, intentar con la original
          if (!isFallback && imageUrl !== optimizedUrl) {
            loadImage(imageUrl, true);
          } else if (!isFallback && fallbackImage && !isAttemptingFallback) {
            setIsAttemptingFallback(true);
            loadImage(fallbackImage, true);
          } else {
            setHasError(true);
            setIsLoaded(false);
            onError?.();
          }
        };

        // Forzar la carga inmediata
        img.src = optimizedUrl;
        
        // Si es prioritaria, también forzar la carga en el DOM
        if (priority && !isFallback) {
          img.loading = 'eager';
        }
      } catch (e) {
        // Invalid URL, use fallback immediately
        console.error('Invalid image URL:', imageUrl);
        if (fallbackImage && !isAttemptingFallback) {
          setIsAttemptingFallback(true);
          loadImage(fallbackImage, true);
        } else {
          setHasError(true);
          setIsLoaded(false);
          onError?.();
        }
      }
    };

    loadImage(src);
  }, [src, fallbackImage, priority, onLoad, onError, isAttemptingFallback, size, isInView, getOptimizedImageUrl]);

  // Si hay error y no hay imagen cargada, mostrar placeholder discreto
  if (hasError && !isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
        <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-gray-400 rounded opacity-50"></div>
        </div>
      </div>
    );
  }

  // Estados de carga - mostrar placeholder discreto para lazy loading
  if (!isInView) {
    return (
      <div 
        ref={imgRef}
        className={`flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}
      >
        <div className="w-6 h-6 bg-gray-200 rounded opacity-40"></div>
      </div>
    );
  }

  // Estados de carga - sin emoji, solo spinner discreto
  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
        <div className="w-8 h-8 border-2 border-gray-200 rounded-full animate-spin border-t-primary"></div>
      </div>
    );
  }

  // Imagen cargada exitosamente
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        ref={imgRef}
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
