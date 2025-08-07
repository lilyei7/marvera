import React, { useEffect } from 'react';
import { ChevronRightIcon, TruckIcon, ShieldCheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchFeaturedProducts } from '../store/slices/featuredProductsSlice';
import { useResponsive } from '../hooks/useResponsive';
import { ResponsiveSection } from '../components/responsive/ResponsiveLayout';
import { ResponsiveGrid, ResponsiveText } from '../components/responsive/ResponsiveComponents';
import ResponsiveProductCard from '../components/responsive/ResponsiveProductCard';
import SimpleImage from '../components/common/SimpleImage';
import { FRONTEND_ROUTES } from '../config/routes';

const ResponsiveHomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: featuredProducts, loading, error } = useAppSelector((state) => state.featuredProducts);
  
  const { 
    shouldUseCompactLayout, 
    productsPerRow 
  } = useResponsive();

  useEffect(() => {
    console.log('🔄 Cargando productos destacados desde la base de datos...');
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  // Hero Section Responsivo
  const HeroSection = () => (
    <ResponsiveSection 
      size="lg" 
      background="blue"
      className="relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800"></div>
        <div className="absolute inset-0" 
             style={{
               backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
             }}>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className={`grid ${shouldUseCompactLayout ? 'grid-cols-1 gap-8' : 'grid-cols-1 lg:grid-cols-2 gap-12'} items-center`}>
          {/* Contenido principal */}
          <div className={shouldUseCompactLayout ? 'text-center' : 'text-left'}>
            <ResponsiveText 
              variant="h1" 
              className="text-white mb-6 leading-tight"
            >
              Mariscos Frescos
              <span className="block text-blue-200">Directo del Mar</span>
            </ResponsiveText>
            
            <ResponsiveText 
              variant="body" 
              className="text-blue-100 mb-8 max-w-xl"
            >
              Descubre la mejor selección de pescados y mariscos frescos, 
              traídos directamente desde las costas mexicanas hasta tu mesa. 
              Calidad garantizada y entrega rápida.
            </ResponsiveText>

            <div className={`${shouldUseCompactLayout ? 'flex flex-col space-y-4' : 'flex space-x-4'}`}>
              <Link
                to={FRONTEND_ROUTES.PRODUCTS}
                className={`inline-flex items-center justify-center bg-white text-primary font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 ${
                  shouldUseCompactLayout ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-base lg:px-8 lg:py-4 lg:text-lg'
                }`}
              >
                Ver Productos
                <ChevronRightIcon className="ml-2 h-5 w-5" />
              </Link>
              
              <Link
                to={FRONTEND_ROUTES.WHOLESALE}
                className={`inline-flex items-center justify-center border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary transition-all duration-200 ${
                  shouldUseCompactLayout ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-base lg:px-8 lg:py-4 lg:text-lg'
                }`}
              >
                Compra Mayoreo
              </Link>
            </div>
          </div>

          {/* Imagen hero - solo en desktop */}
          {!shouldUseCompactLayout && (
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <SimpleImage
                  src="/fondorectangulo3.png"
                  alt="Mariscos frescos MarVera"
                  className="w-full h-96 object-cover"
                />
              </div>
              
              {/* Floating card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-6 shadow-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <ShieldCheckIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">100% Fresco</p>
                    <p className="text-sm text-gray-600">Garantía de calidad</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ResponsiveSection>
  );

  // Características responsivas
  const FeaturesSection = () => {
    const features = [
      {
        icon: TruckIcon,
        title: 'Entrega Rápida',
        description: 'Delivery en 2-4 horas en CDMX y área metropolitana'
      },
      {
        icon: ShieldCheckIcon,
        title: 'Calidad Garantizada',
        description: 'Productos frescos directamente de las mejores pesquerías'
      },
      {
        icon: ClockIcon,
        title: 'Siempre Disponible',
        description: 'Servicio 24/7 para atender todas tus necesidades'
      }
    ];

    return (
      <ResponsiveSection 
        size="md" 
        title="¿Por qué elegir MarVera?"
        subtitle="Somos líderes en distribución de mariscos frescos con más de 20 años de experiencia"
      >
        <ResponsiveGrid
          cols={{
            mobile: 1,
            tablet: 3,
            desktop: 3,
            largeDesktop: 3
          }}
          gap="lg"
        >
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`text-center ${shouldUseCompactLayout ? 'p-6' : 'p-8'} bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300`}
            >
              <div className={`inline-flex items-center justify-center ${shouldUseCompactLayout ? 'w-16 h-16' : 'w-20 h-20'} bg-blue-100 rounded-full mb-6`}>
                <feature.icon className={`${shouldUseCompactLayout ? 'h-8 w-8' : 'h-10 w-10'} text-primary`} />
              </div>
              
              <ResponsiveText variant="h3" className="text-gray-900 mb-4">
                {feature.title}
              </ResponsiveText>
              
              <ResponsiveText variant="body" className="text-gray-600">
                {feature.description}
              </ResponsiveText>
            </div>
          ))}
        </ResponsiveGrid>
      </ResponsiveSection>
    );
  };

  // Productos destacados responsivos
  const FeaturedProductsSection = () => {
    if (loading) {
      return (
        <ResponsiveSection 
          size="md" 
          title="Productos Destacados"
          background="gray"
        >
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
          </div>
        </ResponsiveSection>
      );
    }

    if (error || !featuredProducts || featuredProducts.length === 0) {
      return (
        <ResponsiveSection 
          size="md" 
          title="Productos Destacados"
          background="gray"
        >
          <div className="text-center">
            <ResponsiveText variant="body" className="text-gray-600">
              No hay productos destacados disponibles en este momento.
            </ResponsiveText>
            <Link
              to={FRONTEND_ROUTES.PRODUCTS}
              className="inline-block mt-4 bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Todos Los Productos
            </Link>
          </div>
        </ResponsiveSection>
      );
    }

    return (
      <ResponsiveSection 
        size="md" 
        title="Productos Destacados"
        subtitle="Nuestra selección de los mejores mariscos y pescados frescos"
        background="gray"
      >
        <ResponsiveGrid
          cols={{
            mobile: 1,
            tablet: 2,
            desktop: 3,
            largeDesktop: 4
          }}
          gap="md"
        >
          {featuredProducts.slice(0, shouldUseCompactLayout ? 4 : 8).map((product, index) => (
            <ResponsiveProductCard
              key={product.id}
              product={{
                ...product,
                imageUrl: product.image || '/images/default.webp',
                category: product.category as any, // Cast temporal para evitar error de tipo
                unit: product.unit || 'unidad' // Asegurar que unit no sea undefined
              }}
              priority={index < productsPerRow}
              onClick={() => console.log('Ver producto:', product.id)}
            />
          ))}
        </ResponsiveGrid>

        <div className="text-center mt-12">
          <Link
            to={FRONTEND_ROUTES.PRODUCTS}
            className={`inline-flex items-center bg-primary text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors ${
              shouldUseCompactLayout ? 'px-8 py-4 text-lg' : 'px-6 py-3 text-base'
            }`}
          >
            Ver Todos Los Productos
            <ChevronRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </ResponsiveSection>
    );
  };

  // CTA Section responsivo
  const CTASection = () => (
    <ResponsiveSection 
      size="md" 
      background="blue"
      className="relative overflow-hidden"
    >
      <div className="relative text-center">
        <ResponsiveText 
          variant="h2" 
          className="text-white mb-6"
        >
          ¿Listo para disfrutar del mejor marisco?
        </ResponsiveText>
        
        <ResponsiveText 
          variant="body" 
          className="text-blue-100 mb-8 max-w-2xl mx-auto"
        >
          Únete a miles de clientes satisfechos que confían en la calidad 
          y frescura de nuestros productos marinos.
        </ResponsiveText>

        <div className={`${shouldUseCompactLayout ? 'flex flex-col space-y-4' : 'flex justify-center space-x-4'}`}>
          <Link
            to={FRONTEND_ROUTES.PRODUCTS}
            className={`inline-flex items-center justify-center bg-white text-primary font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 ${
              shouldUseCompactLayout ? 'px-8 py-4 text-lg' : 'px-8 py-4 text-lg'
            }`}
          >
            Comprar Ahora
          </Link>
          
          <Link
            to={FRONTEND_ROUTES.BRANCHES}
            className={`inline-flex items-center justify-center border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary transition-all duration-200 ${
              shouldUseCompactLayout ? 'px-8 py-4 text-lg' : 'px-8 py-4 text-lg'
            }`}
          >
            Visitar Sucursales
          </Link>
        </div>
      </div>
    </ResponsiveSection>
  );

  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <FeaturesSection />
      <FeaturedProductsSection />
      <CTASection />
    </div>
  );
};

export default ResponsiveHomePage;
