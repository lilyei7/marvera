import React, { useState, useRef } from 'react';
import { XMarkIcon, CloudArrowUpIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface MultiImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  title?: string;
  description?: string;
}

const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({
  images = [],
  onChange,
  maxImages = 5,
  title = "Imágenes del producto",
  description = "Puedes agregar hasta " + maxImages + " imágenes. Usa URLs de imágenes, emojis o sube archivos desde tu dispositivo."
}) => {
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  // Emojis marinos populares para productos
  const marineEmojis = [
    '🐟', '🦐', '🦞', '🦀', '🦪', '🐙', '🦑', '🐠', '🐡', '🦈',
    '🐋', '🐬', '🪼', '🦭', '🦅', '🐚', '🏖️', '🌊', '⚓', '🚢',
    '🎣', '🦔', '🐢', '🦎', '🐊', '🦏', '🦛', '🦒', '🦓', '🐘'
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      alert(`Solo puedes subir máximo ${maxImages} imágenes en total`);
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('images', file);
      });

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/upload/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        const newImages = data.images.map((img: string) => `${API_BASE_URL}${img}`);
        const updatedImages = [...images, ...newImages];
        onChange(updatedImages);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error al subir las imágenes');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error de conexión al subir las imágenes');
    } finally {
      setUploading(false);
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const addImageUrl = () => {
    if (newImageUrl.trim() && images.length < maxImages) {
      const updatedImages = [...images, newImageUrl.trim()];
      onChange(updatedImages);
      setNewImageUrl('');
    }
  };

  const addEmoji = (emoji: string) => {
    if (images.length < maxImages) {
      const updatedImages = [...images, emoji];
      onChange(updatedImages);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onChange(updatedImages);
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    
    const newImages = [...images];
    const [movedImage] = newImages.splice(from, 1);
    newImages.splice(to, 0, movedImage);
    onChange(newImages);
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const renderImagePreview = (image: string, index: number) => {
    const isUrl = isValidUrl(image);
    const isEmoji = !isUrl && image.length <= 4;

    return (
      <div key={index} className="relative group">
        <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden">
          {isUrl ? (
            <img 
              src={image} 
              alt={`Preview ${index + 1}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const nextEl = target.nextElementSibling as HTMLElement;
                if (nextEl) nextEl.style.display = 'flex';
              }}
            />
          ) : isEmoji ? (
            <span className="text-3xl">{image}</span>
          ) : (
            <span className="text-xs text-gray-500 text-center p-1">{image}</span>
          )}
          
          {/* Error fallback para URLs */}
          {isUrl && (
            <div className="w-full h-full bg-red-50 items-center justify-center text-red-400 text-xs hidden">
              Error
            </div>
          )}
        </div>
        
        {/* Botones de control */}
        <div className="absolute -top-2 -right-2 flex gap-1">
          <button
            onClick={() => removeImage(index)}
            className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
        
        {/* Botones de reordenamiento */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {index > 0 && (
            <button
              onClick={() => moveImage(index, index - 1)}
              className="w-5 h-5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              ←
            </button>
          )}
          {index < images.length - 1 && (
            <button
              onClick={() => moveImage(index, index + 1)}
              className="w-5 h-5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              →
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-1">{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>

      {/* Vista previa de imágenes */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((image, index) => renderImagePreview(image, index))}
        </div>
      )}

      {/* Sección de agregar imágenes */}
      {images.length < maxImages && (
        <div className="space-y-4">
          {/* Subir archivos */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex flex-col items-center justify-center py-3 px-4 text-sm text-gray-600 hover:text-marina-600 hover:border-marina-300 transition-colors disabled:opacity-50"
            >
              <CloudArrowUpIcon className="w-8 h-8 mb-2" />
              {uploading ? 'Subiendo...' : 'Subir imágenes desde tu dispositivo'}
              <span className="text-xs text-gray-400 mt-1">
                JPG, PNG, GIF hasta 5MB
              </span>
            </button>
          </div>

          {/* Agregar URL */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-marina-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={addImageUrl}
              className="px-4 py-2 bg-marina-600 text-white rounded-md hover:bg-marina-700 transition-colors text-sm flex items-center gap-1"
            >
              <PhotoIcon className="w-4 h-4" />
              Agregar URL
            </button>
          </div>

          {/* Emojis marinos */}
          <div>
            <h4 className="text-xs font-medium text-gray-600 mb-2">O selecciona un emoji:</h4>
            <div className="grid grid-cols-10 gap-1">
              {marineEmojis.map((emoji, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addEmoji(emoji)}
                  className="w-8 h-8 text-lg hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
                  title={`Agregar ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Información sobre límite */}
      <div className="text-xs text-gray-500">
        {images.length} de {maxImages} imágenes agregadas
      </div>
    </div>
  );
};

export default MultiImageUploader;
