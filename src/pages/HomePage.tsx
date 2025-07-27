import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
// import FloatingMarineEmojis from '../components/FloatingMarineEmojis';
// import { useAppDispatch } from '../store/hooks';
// import { addToCart } from '../store/slices/cartSlice';
// import { addNotification } from '../store/slices/notificationSlice';

const HomePage: React.FC = () => {
  // const dispatch = useAppDispatch();

  // Función comentada temporalmente hasta implementar productos en homepage
  // const handleAddToCart = (product: any, event?: React.MouseEvent) => {
  //   if (event) {
  //     const button = event.currentTarget as HTMLElement;
  //     button.classList.add('animate-product-add');
  //     setTimeout(() => {
  //       button.classList.remove('animate-product-add');
  //     }, 600);
  //   }
  //   
  //   dispatch(addToCart({ product, quantity: 1 }));
  //   dispatch(addNotification({
  //     message: `${product.name} agregado al carrito 🛒`,
  //     type: 'success',
  //     duration: 2000
  //   }));
  // };

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Section with Seafood - Nueva Paleta MarVera */}
      <section className="relative">
        {/* Emojis marinos flotantes de fondo */}
        {/** <FloatingMarineEmojis /> **/}
        
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 md:py-8 lg:py-12 xl:py-16">
          {/* Main Hero Card con fondo estético de salmón */}
          <div className="relative bg-gradient-to-br from-deep-navy via-dark-blue to-vibrant-blue rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl lg:shadow-2xl">
            {/* Fondo de salmón estético animado */}
           
            <div className="relative flex flex-col lg:flex-row items-center min-h-[400px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[400px] xl:min-h-[450px]" style={{  backgroundImage: 'url(/fondorectangulo3.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              {/* Gradiente removido temporalmente */}
              {/* Content sobre el gradiente */}
              <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 text-white relative z-20">
                <h1
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-2 sm:mb-3 md:mb-4 leading-tight"
                  style={{ color: 'white' }}
                >
                  Del mar directo a tu restaurante
                </h1>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-4 sm:mb-6 md:mb-8 max-w-2xl leading-relaxed" style={{ color: 'white' }}>
                  Ofrecemos mariscos de la más alta calidad, garantizando frescura y sabor excepcionales para que tus clientes disfruten una experiencia gastronómica inigualable.
                </p>
                <Link 
                  to="/products"
                  className="bg-vibrant-blue text-white hover:bg-light-peach hover:text-deep-navy font-semibold py-2 sm:py-2.5 md:py-3 lg:py-3.5 px-4 sm:px-6 md:px-8 lg:px-10 rounded-md sm:rounded-lg transition-all duration-300 inline-flex items-center group hover-lift btn-gradient-primary text-sm sm:text-base lg:text-lg shadow-lg hover:shadow-xl"
                >
                  Ver productos
                  <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-1.5 sm:ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
              {/* Seafood Image */}
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Productos Destacados */}
      <section className="py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16 bg-light">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-4 sm:mb-6 lg:mb-8 text-center">Productos Destacados</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {/* Salmón Salvaje */}
            <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 hover-lift group">
              <div className="h-32 xs:h-36 sm:h-40 md:h-44 lg:h-48 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="w-20 h-16 xs:w-24 xs:h-18 sm:w-28 sm:h-20 md:w-32 md:h-24 bg-gradient-to-br from-orange-200 to-orange-300 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md sm:shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <span className="text-2xl xs:text-3xl sm:text-4xl animate-bounce-gentle">🐟</span>
                  </div>
                </div>
                <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-primary text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full animate-pulse">
                  Fresco
                </div>
              </div>
              <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-1 sm:mb-2 group-hover:text-primary transition-colors duration-300">Salmón Salvaje</h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 md:mb-4">Origen sostenible, sabor intenso</p>
                <button className="w-full bg-button hover:bg-primary text-white font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-md sm:rounded-lg transition-all duration-300 hover-lift btn-gradient-primary group text-xs sm:text-sm">
                  <span className="group-hover:scale-105 transition-transform duration-300 inline-block">Agregar al carrito</span>
                </button>
              </div>
            </div>

            {/* Langosta Viva de Maine */}
            <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 hover-lift group">
              <div className="h-32 xs:h-36 sm:h-40 md:h-44 lg:h-48 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="w-20 h-16 xs:w-24 xs:h-18 sm:w-28 sm:h-20 md:w-32 md:h-24 bg-gradient-to-br from-red-200 to-red-300 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md sm:shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <span className="text-2xl xs:text-3xl sm:text-4xl animate-bounce-gentle" style={{animationDelay: '0.2s'}}>🦞</span>
                  </div>
                </div>
                <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-accent text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}>
                  Viva
                </div>
              </div>
              <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-1 sm:mb-2 group-hover:text-primary transition-colors duration-300">Langosta Viva de Maine</h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 md:mb-4">Entrega viva para máxima frescura</p>
                <button className="w-full bg-button hover:bg-primary text-white font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-md sm:rounded-lg transition-all duration-300 hover-lift btn-gradient-primary group text-xs sm:text-sm">
                  <span className="group-hover:scale-105 transition-transform duration-300 inline-block">Agregar al carrito</span>
                </button>
              </div>
            </div>

            {/* Ostras Premium */}
            <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 hover-lift group">
              <div className="h-32 xs:h-36 sm:h-40 md:h-44 lg:h-48 bg-gradient-to-br from-secondary to-accent relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="w-20 h-16 xs:w-24 xs:h-18 sm:w-28 sm:h-20 md:w-32 md:h-24 bg-gradient-to-br from-gray-200 to-light rounded-lg sm:rounded-xl flex items-center justify-center shadow-md sm:shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <span className="text-2xl xs:text-3xl sm:text-4xl animate-bounce-gentle" style={{animationDelay: '0.4s'}}>🦪</span>
                  </div>
                </div>
                <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-light text-primary text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full animate-pulse font-semibold" style={{animationDelay: '0.7s'}}>
                  Premium
                </div>
              </div>
              <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-1 sm:mb-2 group-hover:text-primary transition-colors duration-300">Ostras Premium</h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 md:mb-4">Cosechadas a diario, saladas y deliciosas</p>
                <button className="w-full bg-button hover:bg-primary text-white font-medium py-1.5 sm:py-2 px-3 sm:px-4 rounded-md sm:rounded-lg transition-all duration-300 hover-lift btn-gradient-primary group text-xs sm:text-sm">
                  <span className="group-hover:scale-105 transition-transform duration-300 inline-block">Agregar al carrito</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Ofertas Especiales */}
      <section className="py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-4 sm:mb-6 lg:mb-8 text-center">Ofertas Especiales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Banquete de Mariscos de Verano */}
            <div className="relative bg-gray-100 rounded-xl sm:rounded-2xl overflow-hidden">
              <div className="h-32 xs:h-36 sm:h-40 md:h-48 lg:h-56 xl:h-64 bg-gradient-to-br from-accent to-secondary relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white px-2 sm:px-4">
                    <div className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-1 sm:mb-2 lg:mb-4">🍽️🦐🐟</div>
                    <div className="text-xs sm:text-sm text-light font-semibold">ESPECIAL DE VERANO</div>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Banquete de Mariscos de Verano</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Aprovecha 20% de descuento en combos seleccionados</p>
              </div>
            </div>

            {/* Especiales de Mariscos para Fiestas */}
            <div className="relative bg-gray-100 rounded-xl sm:rounded-2xl overflow-hidden">
              <div className="h-32 xs:h-36 sm:h-40 md:h-48 lg:h-56 xl:h-64 bg-gradient-to-br from-gray-700 to-gray-900 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white px-2 sm:px-4">
                    <div className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-1 sm:mb-2 lg:mb-4">🎉🦞🦪</div>
                    <div className="text-xs sm:text-sm text-gray-300 font-semibold">ESPECIAL DE FIESTAS</div>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4 md:p-5 lg:p-6">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">Especiales de Mariscos para Fiestas</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Celebra con nuestras selecciones festivas de mariscos</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Newsletter */}
      <section className="py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16 bg-light">
        <div className="max-w-4xl mx-auto text-center px-2 sm:px-4 lg:px-6 xl:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2 sm:mb-3 md:mb-4">Suscríbete a Nuestro Boletín</h2>
          <p className="text-gray-600 mb-4 sm:mb-6 lg:mb-8 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto">Recibe novedades sobre las mejores capturas, ofertas exclusivas y recetas deliciosas.</p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center items-stretch sm:items-center max-w-sm sm:max-w-md md:max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Ingresa tu correo electrónico" 
              className="w-full sm:flex-1 px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-md sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-accent hover:shadow-md text-sm sm:text-base"
            />
            <button className="w-full sm:w-auto bg-button hover:bg-primary text-white font-semibold py-2 sm:py-2.5 md:py-3 px-4 sm:px-6 lg:px-8 rounded-md sm:rounded-lg transition-all duration-300 whitespace-nowrap hover-lift btn-gradient-primary group text-sm sm:text-base">
              <span className="group-hover:scale-105 transition-transform duration-300 inline-block">Suscribirse</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
