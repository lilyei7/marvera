import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { SlideshowService } from '../api/slideshow';
import { getApiUrl } from '../config/api';
import type { Slide } from '../api/slideshow';

const Slideshow: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000); // Cambia cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [slides.length]);

  const fetchSlides = async () => {
    try {
      console.log('🎪 Obteniendo slides del servidor...');
      
      // Usar el servicio API unificado
      const response = await SlideshowService.getActive();
      
      if (response.success && response.data?.data && response.data.data.length > 0) {
        console.log('✅ Slides cargadas desde API:', response.data.data.length);
        setSlides(response.data.data);
        return;
      }
      
      console.log('⚠️ No hay slides en la API, usando fallback');
      // Fallback con datos estáticos si la API no funciona
      const staticSlides: Slide[] = [
        {
          id: 1,
          title: 'Del mar directo a tu restaurante',
          subtitle: 'Productos frescos del mar',
          description: 'Mariscos frescos y productos del mar de la más alta calidad',
          buttonText: 'Ver Productos',
          buttonLink: '/products',
          imageUrl: '/fondorectangulo3.png',
          backgroundColor: '#1E3A8A',
          textColor: '#FFFFFF',
          isActive: true,
          order: 0
        },
        {
          id: 2,
          title: 'Ofertas Especiales',
          subtitle: 'Descuentos increíbles',
          description: 'No te pierdas nuestras promociones semanales',
          buttonText: 'Ver Ofertas',
          buttonLink: '/products',
          imageUrl: undefined,
          backgroundColor: '#DC2626',
          textColor: '#FFFFFF',
          isActive: true,
          order: 1
        }
      ];

      setSlides(staticSlides);
    } catch (error) {
      console.error('❌ Error obteniendo slides:', error);
      // Fallback con datos estáticos
      setSlides([
        {
          id: 1,
          title: 'Del mar directo a tu restaurante',
          subtitle: 'Productos frescos del mar',
          description: 'Mariscos frescos y productos del mar de la más alta calidad',
          buttonText: 'Ver Productos',
          buttonLink: '/products',
          imageUrl: '/fondorectangulo3.png',
          backgroundColor: '#1E3A8A',
          textColor: '#FFFFFF',
          isActive: true,
          order: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <div className="relative h-96 bg-gray-200 animate-pulse rounded-lg">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-500">Cargando slideshow...</div>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="relative h-96 bg-blue-900 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-white text-center p-8">
          <div>
            <h2 className="text-4xl font-bold mb-4">MarVera</h2>
            <p className="text-xl opacity-90">Tu mejor opción en mariscos frescos</p>
          </div>
        </div>
      </div>
    );
  }

  const slide = slides[currentSlide];

  return (
    <div className="relative h-96 rounded-lg overflow-hidden shadow-lg">
      {/* Slide actual */}
      <div
        className="relative w-full h-full flex items-center justify-center transition-all duration-500"
        style={{ backgroundColor: slide.backgroundColor }}
      >
        {/* Imagen de fondo si existe */}
        {slide.imageUrl && (
          <div className="absolute inset-0">
            <img
              src={slide.imageUrl.startsWith('/fondorectangulo') ? slide.imageUrl : `${getApiUrl('')}${slide.imageUrl}`}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div 
              className="absolute inset-0 bg-opacity-50"
              style={{ backgroundColor: slide.backgroundColor }}
            ></div>
          </div>
        )}

        {/* Contenido del slide */}
        <div className="relative z-10 text-center p-8 max-w-4xl">
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: slide.textColor }}
          >
            {slide.title}
          </h1>
          
          {slide.subtitle && (
            <h2 
              className="text-xl md:text-2xl mb-4 opacity-90"
              style={{ color: slide.textColor }}
            >
              {slide.subtitle}
            </h2>
          )}
          
          {slide.description && (
            <p 
              className="text-lg mb-6 opacity-80"
              style={{ color: slide.textColor }}
            >
              {slide.description}
            </p>
          )}
          
          {slide.buttonText && slide.buttonLink && (
            <a
              href={slide.buttonLink}
              className="inline-block px-8 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg font-semibold transition-all duration-300 backdrop-blur-sm border border-white border-opacity-30 hover:border-opacity-50"
              style={{ color: slide.textColor }}
            >
              {slide.buttonText}
            </a>
          )}
        </div>

        {/* Controles de navegación */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition-all duration-300"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full transition-all duration-300"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Indicadores de puntos */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-white'
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Slideshow;
