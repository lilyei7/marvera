import React, { useEffect } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';
import { addNotification } from '../store/slices/notificationSlice';
import { fetchFeaturedProducts } from '../store/slices/featuredProductsSlice';
import type { FeaturedProduct } from '../store/slices/featuredProductsSlice';
import SimpleImage from '../components/common/SimpleImage';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: featuredProducts, loading, error } = useAppSelector((state) => state.featuredProducts);

  useEffect(() => {
    // Cargar productos destacados desde la base de datos
    console.log('🔄 Cargando productos destacados desde la base de datos...');
    dispatch(fetchFeaturedProducts());
  }, [dispatch]);

  // Debug: Log cuando cambien los productos destacados
  useEffect(() => {
    if (featuredProducts && featuredProducts.length > 0) {
      console.log('✅ Productos destacados cargados:', featuredProducts);
      console.log('📊 Total productos destacados:', featuredProducts.length);
    }
  }, [featuredProducts]);

  const handleAddToCart = (product: FeaturedProduct, event?: React.MouseEvent) => {
    if (event) {
      const button = event.currentTarget as HTMLElement;
      button.classList.add('animate-product-add');
      setTimeout(() => {
        button.classList.remove('animate-product-add');
      }, 600);
    }
    
    dispatch(addToCart({ 
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category as any,
        description: product.description,
        inStock: product.inStock,
        unit: product.unit
      }, 
      quantity: 1 
    }));
    
    dispatch(addNotification({
      message: `${product.name} agregado al carrito 🛒`,
      type: 'success',
      duration: 2000
    }));
  };

  return (
    <div className="bg-background min-h-screen main-content">
      {/* Hero Section */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 md:py-6 lg:py-8 xl:py-12">
          <div className="relative bg-gradient-to-br from-deep-navy via-dark-blue to-vibrant-blue rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-md sm:shadow-lg lg:shadow-xl">
            <div className="relative flex flex-col lg:flex-row items-center min-h-[280px] sm:min-h-[320px] md:min-h-[400px] lg:min-h-[400px] xl:min-h-[450px]" style={{  backgroundImage: 'url(/fondorectangulo3.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 text-white relative z-20">
                <h1
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight"
                  style={{ color: 'white', paddingTop: '20px' }}
                >
                  Del mar directo a tu restaurante
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-4 sm:mb-6 md:mb-8 opacity-90">
                  Mariscos frescos y productos del mar de la más alta calidad
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center bg-white text-primary px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-full text-sm sm:text-base md:text-lg font-semibold hover:bg-light transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Ver Productos
                  <ChevronRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </div>
            </div>
          </div>
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
          
          {/* Vista mejorada - Cards con mejor espaciado y imágenes forzadas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {featuredProducts && Array.isArray(featuredProducts) && featuredProducts.length > 0 ? (
              featuredProducts.map((product: FeaturedProduct) => (
                <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/30 transform hover:-translate-y-1">
                  {/* Imagen Container con altura fija y mejor proporción */}
                  <div className="h-52 sm:h-56 md:h-60 lg:h-64 relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                    <SimpleImage
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full"
                      fallbackEmoji={product.emoji}
                      fallbackImage={`https://picsum.photos/400/300?random=${product.id}`}
                    />
                    
                    {/* Tags overlay mejorados */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className={`${product.tagColor} text-white px-3 py-2 rounded-full text-sm font-bold shadow-lg`}>
                        {product.tag}
                      </span>
                    </div>
                    
                    <div className="absolute top-4 right-4 z-10">
                      {product.inStock ? (
                        <span className="bg-green-500 text-white text-sm px-3 py-2 rounded-full font-semibold shadow-lg">
                          ✓ Disponible
                        </span>
                      ) : (
                        <span className="bg-red-500 text-white text-sm px-3 py-2 rounded-full font-semibold shadow-lg">
                          Agotado
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Contenido con mejor espaciado y estructura fija */}
                  <div className="p-5 sm:p-6 space-y-4">
                    {/* Título con altura fija para alineación */}
                    <div className="min-h-[3rem] flex items-start">
                      <h3 className="font-bold text-gray-900 text-lg sm:text-xl line-clamp-2 leading-tight">
                        {product.name}
                      </h3>
                    </div>
                    
                    {/* Descripción con altura fija */}
                    <div className="min-h-[2.5rem]">
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>
                    
                    {/* Categoría con emoji */}
                    <div className="flex items-center gap-2 py-1">
                      <span className="text-xl">{product.emoji}</span>
                      <span className="text-sm text-gray-500 font-medium capitalize">{product.category}</span>
                    </div>
                    
                    {/* Precio con mejor diseño */}
                    <div className="flex items-end justify-between py-3 border-t border-gray-100">
                      <div>
                        <div className="text-2xl sm:text-3xl font-bold text-primary">
                          ${product.price.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          por {product.unit}
                        </div>
                      </div>
                    </div>
                    
                    {/* Botón con mejor diseño */}
                    <button 
                      onClick={(e) => handleAddToCart(product, e)}
                      disabled={!product.inStock}
                      className={`w-full font-bold py-4 px-6 rounded-xl transition-all duration-300 text-base ${
                        product.inStock
                          ? 'bg-primary hover:bg-primary-dark text-white hover:shadow-lg transform hover:-translate-y-0.5'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {product.inStock ? '🛒 Agregar al carrito' : 'No disponible'}
                    </button>
                  </div>
                </div>
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
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            {/* Banquete de Mariscos */}
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

            {/* Combo Sushi */}
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
            to="/products"
            className="inline-flex items-center bg-white text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-semibold hover:bg-light transition-all duration-300 shadow-lg"
          >
            Explorar Catálogo
            <ChevronRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
