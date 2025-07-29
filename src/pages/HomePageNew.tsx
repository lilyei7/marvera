import React, { useEffect, useState } from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';
import { addNotification } from '../store/slices/notificationSlice';

// Tipo para productos destacados
interface FeaturedProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  emoji: string;
  tag?: string;
  tagColor?: string;
}

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);

  // Productos destacados por defecto (hasta conectar con backend)
  const defaultFeaturedProducts: FeaturedProduct[] = [
    {
      id: 1,
      name: "Salmón Noruego",
      description: "Fresco del Atlántico Norte",
      price: 45.99,
      image: "/salmon.jpg",
      category: "Pescado",
      emoji: "🍣",
      tag: "Fresco",
      tagColor: "bg-green-500"
    },
    {
      id: 2,
      name: "Langosta Viva de Maine",
      description: "Entrega viva para máxima frescura",
      price: 89.99,
      image: "/lobster.jpg",
      category: "Mariscos",
      emoji: "🦞",
      tag: "Viva",
      tagColor: "bg-accent"
    },
    {
      id: 3,
      name: "Ostras Premium",
      description: "Cosechadas a diario, saladas y deliciosas",
      price: 24.99,
      image: "/oysters.jpg",
      category: "Moluscos",
      emoji: "🦪",
      tag: "Premium",
      tagColor: "bg-light"
    }
  ];

  useEffect(() => {
    // Por ahora usar productos por defecto, más tarde conectar con backend
    setFeaturedProducts(defaultFeaturedProducts);
  }, []);

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
        id: product.id.toString(),
        name: product.name,
        price: product.price,
        category: product.category as any,
        description: product.description,
        inStock: true,
        unit: 'kg'
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
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 md:py-8 lg:py-12 xl:py-16">
          <div className="relative bg-gradient-to-br from-deep-navy via-dark-blue to-vibrant-blue rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-lg sm:shadow-xl lg:shadow-2xl">
            <div className="relative flex flex-col lg:flex-row items-center min-h-[400px] sm:min-h-[450px] md:min-h-[500px] lg:min-h-[400px] xl:min-h-[450px]" style={{  backgroundImage: 'url(/fondorectangulo3.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 text-white relative z-20">
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 md:mb-5 leading-tight"
                  style={{ color: 'white', paddingTop: '30px' }}
                >
                  Del mar directo a tu restaurante
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-6 sm:mb-8 md:mb-10 opacity-90">
                  Mariscos frescos y productos del mar de la más alta calidad
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center bg-white text-primary px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 rounded-full text-base sm:text-lg md:text-xl font-semibold hover:bg-light transition-all duration-300 hover-lift shadow-lg hover:shadow-xl"
                >
                  Ver Productos
                  <ChevronRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6 sm:mb-8 lg:mb-10 text-center">
            Productos Destacados
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-md sm:shadow-lg hover:shadow-xl transition-all duration-300 hover-lift group">
                <div className="h-32 xs:h-36 sm:h-40 md:h-44 lg:h-48 bg-gradient-to-br from-secondary to-accent relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <div className="w-20 h-16 xs:w-24 xs:h-18 sm:w-28 sm:h-20 md:w-32 md:h-24 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md sm:shadow-lg group-hover:shadow-xl transition-all duration-300">
                      <span className="text-2xl xs:text-3xl sm:text-4xl animate-bounce-gentle">{product.emoji}</span>
                    </div>
                  </div>
                  {product.tag && (
                    <div className={`absolute top-1.5 sm:top-2 right-1.5 sm:right-2 ${product.tagColor || 'bg-green-500'} text-white text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full animate-pulse`}>
                      {product.tag}
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5 md:p-6 lg:p-7">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3 group-hover:text-primary transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4 md:mb-5">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xl sm:text-2xl font-bold text-primary">
                      ${product.price}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => handleAddToCart(product, e)}
                    className="w-full bg-button hover:bg-primary text-white font-medium py-2.5 sm:py-3 px-4 sm:px-5 rounded-lg sm:rounded-xl transition-all duration-300 hover-lift btn-gradient-primary group text-sm sm:text-base"
                  >
                    <span className="group-hover:scale-105 transition-transform duration-300 inline-block">
                      Agregar al carrito
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ofertas Especiales */}
      <section className="py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6 sm:mb-8 lg:mb-10 text-center">
            Ofertas Especiales
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Banquete de Mariscos */}
            <div className="relative bg-gradient-to-br from-accent to-secondary rounded-xl sm:rounded-2xl overflow-hidden p-6 sm:p-8 text-white">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
                Banquete de Mariscos 🍤
              </h3>
              <p className="text-base sm:text-lg mb-4 sm:mb-6 opacity-90">
                Selección especial para 4 personas
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm opacity-75 line-through">$159.99</span>
                  <span className="text-2xl sm:text-3xl font-bold ml-2">$119.99</span>
                </div>
                <button className="bg-white text-primary px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Ver Oferta
                </button>
              </div>
            </div>

            {/* Combo Sushi */}
            <div className="relative bg-gradient-to-br from-primary to-deep-navy rounded-xl sm:rounded-2xl overflow-hidden p-6 sm:p-8 text-white">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
                Combo Sushi Premium 🍣
              </h3>
              <p className="text-base sm:text-lg mb-4 sm:mb-6 opacity-90">
                Salmón, atún y pescados selectos
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm opacity-75 line-through">$89.99</span>
                  <span className="text-2xl sm:text-3xl font-bold ml-2">$69.99</span>
                </div>
                <button className="bg-white text-primary px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Ver Combo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 sm:py-16 lg:py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            ¿Listo para el mejor marisco?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 opacity-90">
            Únete a miles de restaurantes que confían en MarVera
          </p>
          <Link
            to="/products"
            className="inline-flex items-center bg-white text-primary px-8 sm:px-10 py-4 sm:py-5 rounded-full text-lg sm:text-xl font-semibold hover:bg-light transition-all duration-300 hover-lift shadow-xl"
          >
            Explorar Catálogo
            <ChevronRightIcon className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
