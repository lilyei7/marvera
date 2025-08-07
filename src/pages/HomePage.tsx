import React, { useEffect, useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';
import { addNotification } from '../store/slices/notificationSlice';
import { fetchFeaturedProducts } from '../store/slices/featuredProductsSlice';
import { fetchFeaturedOffers } from '../store/slices/offersSlice';
import type { FeaturedProduct } from '../store/slices/featuredProductsSlice';
import type { SpecialOffer } from '../store/slices/offersSlice';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import Slideshow from '../components/Slideshow';
import { FRONTEND_ROUTES } from '../config/routes';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: featuredProducts, loading, error } = useAppSelector((state) => state.featuredProducts);
  const { featuredOffers, loading: offersLoading, error: offersError } = useAppSelector((state) => state.offers);
  
  // Estado para modal de productos
  const [selectedProduct, setSelectedProduct] = useState<FeaturedProduct | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Cargar productos destacados y ofertas desde la base de datos
    console.log('🔄 Cargando productos destacados desde la base de datos...');
    dispatch(fetchFeaturedProducts());
    
    console.log('🔄 Cargando ofertas destacadas desde la base de datos...');
    dispatch(fetchFeaturedOffers());
  }, [dispatch]);

  // Debug: Log cuando cambien los productos destacados
  useEffect(() => {
    console.log('🔍 Estado completo de productos destacados:', { featuredProducts, loading, error });
    if (featuredProducts && featuredProducts.length > 0) {
      console.log('✅ Productos destacados cargados:', featuredProducts);
      console.log('📊 Total productos destacados:', featuredProducts.length);
    } else {
      console.log('⚠️ No hay productos destacados disponibles:', { featuredProducts, loading, error });
    }
  }, [featuredProducts, loading, error]);

  const handleAddToCart = (product: FeaturedProduct, quantity: number = 1) => {
    dispatch(addToCart({ 
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category as any,
        description: product.description,
        inStock: product.inStock,
        unit: product.unit,
        imageUrl: product.image || '/images/default-product.jpg'
      }, 
      quantity 
    }));
    
    dispatch(addNotification({
      message: `${product.name} agregado al carrito 🛒`,
      type: 'success',
      duration: 2000
    }));
  };

  const handleProductClick = (product: FeaturedProduct) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  return (
    <div className="bg-background min-h-screen main-content">
      {/* Hero Section - Slideshow */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 md:py-6 lg:py-8 xl:py-12">
          <Slideshow />
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-4 sm:py-6 md:py-8 lg:py-12 xl:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary mb-4 sm:mb-6 lg:mb-8 xl:mb-10 text-center">
            Productos Destacados
            {/* Indicador de origen de datos para debug */}
            <div className="mt-2 text-xs sm:text-sm text-gray-500 font-normal">
              {loading ? '🔄 Cargando desde base de datos...' : 
               error ? '❌ Error de conexión - usando datos locales' : 
               featuredProducts.length > 0 ? '✅ Datos desde base de datos' : ''}
            </div>
          </h2>
          
          {/* Loading state */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button 
                onClick={() => dispatch(fetchFeaturedProducts())}
                className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}
          
          {/* Vista con ProductCard para consistencia con /productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {featuredProducts && Array.isArray(featuredProducts) && featuredProducts.length > 0 ? (
              featuredProducts.map((product: FeaturedProduct) => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    images: product.image ? [product.image] : [],
                    imageUrl: product.image,
                    stock: product.inStock ? 10 : 0,
                    category: {
                      name: product.category,
                      slug: product.category.toLowerCase()
                    }
                  }}
                  onAddToCart={handleAddToCart}
                  onClick={handleProductClick}
                />
              ))
            ) : (
              // When there are no products to show
              !loading && !error && (
                <div className="col-span-3 text-center py-8">
                  <p className="text-gray-500">No hay productos destacados disponibles</p>
                </div>
              )
            )}
          </div>
          
          {/* Sin productos disponibles */}
          {/* Removed duplicate "no products" message as it's now handled in the grid */}
        </div>
      </section>

      {/* Ofertas Especiales */}
      <section className="py-4 sm:py-6 md:py-8 lg:py-12 xl:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary mb-4 sm:mb-6 lg:mb-8 xl:mb-10 text-center">
            Ofertas Especiales
            {/* Indicador de origen de datos para debug */}
            <div className="mt-2 text-xs sm:text-sm text-gray-500 font-normal">
              {offersLoading ? '🔄 Cargando ofertas desde base de datos...' : 
               offersError ? '❌ Error de conexión ofertas - usando datos locales' : 
               featuredOffers.length > 0 ? '✅ Ofertas desde base de datos' : ''}
            </div>
          </h2>
          
          {/* Loading state para ofertas */}
          {offersLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Error state para ofertas */}
          {offersError && (
            <div className="text-center py-8">
              <p className="text-red-500">{offersError}</p>
              <button 
                onClick={() => dispatch(fetchFeaturedOffers())}
                className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}
          
          {/* Grid de ofertas dinámicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            {featuredOffers && featuredOffers.length > 0 ? (
              featuredOffers.map((offer: SpecialOffer) => (
                <div 
                  key={offer.id}
                  className="relative rounded-lg sm:rounded-xl overflow-hidden p-4 sm:p-6 text-white"
                  style={{ backgroundColor: offer.backgroundColor }}
                >
                  {/* Imagen de fondo si existe */}
                  {offer.imageUrl && (
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-20"
                      style={{ 
                        backgroundImage: `url(https://marvera.mx${offer.imageUrl})`,
                        backgroundBlendMode: 'overlay'
                      }}
                    />
                  )}
                  
                  {/* Contenido de la oferta */}
                  <div className="relative z-10">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">
                      {offer.title}
                    </h3>
                    <p className="text-sm sm:text-base mb-3 sm:mb-4 opacity-90">
                      {offer.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs sm:text-sm opacity-75 line-through">
                          ${offer.originalPrice.toLocaleString()}
                        </span>
                        <span className="text-xl sm:text-2xl font-bold ml-2">
                          ${offer.discountPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        {offer.discountPercent && (
                          <div className="text-xs bg-black bg-opacity-20 px-2 py-1 rounded">
                            -{offer.discountPercent}% OFF
                          </div>
                        )}
                        <button className="bg-white text-primary px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm">
                          Ver Oferta
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Ofertas por defecto si no hay datos de la BD
              !offersLoading && !offersError && (
                <>
                  {/* Banquete de Mariscos por defecto */}
                  <div className="relative bg-gradient-to-br from-accent to-secondary rounded-lg sm:rounded-xl overflow-hidden p-4 sm:p-6 text-white">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">
                      Banquete de Mariscos 🍤
                    </h3>
                    <p className="text-sm sm:text-base mb-3 sm:mb-4 opacity-90">
                      Selección especial para 4 personas
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs sm:text-sm opacity-75 line-through">$159.99</span>
                        <span className="text-xl sm:text-2xl font-bold ml-2">$119.99</span>
                      </div>
                      <button className="bg-white text-primary px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm">
                        Ver Oferta
                      </button>
                    </div>
                  </div>

                  {/* Combo Sushi por defecto */}
                  <div className="relative bg-gradient-to-br from-primary to-deep-navy rounded-lg sm:rounded-xl overflow-hidden p-4 sm:p-6 text-white">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">
                      Combo Sushi Premium 🍣
                    </h3>
                    <p className="text-sm sm:text-base mb-3 sm:mb-4 opacity-90">
                      Salmón, atún y pescados selectos
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs sm:text-sm opacity-75 line-through">$89.99</span>
                        <span className="text-xl sm:text-2xl font-bold ml-2">$69.99</span>
                      </div>
                      <button className="bg-white text-primary px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-sm">
                        Ver Combo
                      </button>
                    </div>
                  </div>
                </>
              )
            )}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-8 sm:py-12 lg:py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            ¿Listo para el mejor marisco?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90">
            Únete a miles de restaurantes que confían en MarVera
          </p>
          <Link
            to={FRONTEND_ROUTES.PRODUCTS}
            className="inline-flex items-center bg-white text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-light transition-all duration-300 shadow-lg"
          >
            Explorar Catálogo
            <ChevronRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
      
      {/* Modal de detalles de producto */}
      {selectedProduct && (
        <ProductDetailModal
          product={{
            ...selectedProduct,
            images: selectedProduct.image ? [selectedProduct.image] : [],
            imageUrl: selectedProduct.image,
            stock: selectedProduct.inStock ? 10 : 0,
            category: {
              name: selectedProduct.category,
              slug: selectedProduct.category.toLowerCase()
            }
          }}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCart}
        />
      )}
    </div>
  );
};

export default HomePage;
