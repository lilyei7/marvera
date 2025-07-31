import React, { useState, useEffect } from 'react';

// Define simple image component without all the complexity
const SimpleImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  fallbackEmoji?: string;
  fallbackImage?: string;
}> = ({ src, alt, className = '', fallbackEmoji = '🐟', fallbackImage }) => {
  const [error, setError] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  
  // Reset error state if src changes
  useEffect(() => {
    setError(false);
    setImageSrc(src);
    setIsFallback(false);
  }, [src]);
  
  const handleError = () => {
    if (!isFallback && fallbackImage) {
      // Try fallback image
      setIsFallback(true);
      setImageSrc(fallbackImage);
    } else {
      // If fallback fails or there's no fallback, show emoji
      setError(true);
    }
  };
  
  if (!imageSrc || error) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 ${className}`}>
        <div className="text-center">
          <div className="text-4xl sm:text-5xl md:text-6xl">
            {fallbackEmoji}
          </div>
          <div className="text-xs text-gray-500 font-medium">
            Imagen no disponible
          </div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      onError={handleError}
      loading="lazy"
    />
  );
};

export default SimpleImage;
