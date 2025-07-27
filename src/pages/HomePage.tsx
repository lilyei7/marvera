import React from 'react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
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
      {/* Hero Section with Seafood */}
      <section className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-16">
          {/* Main Hero Card */}
          <div className="relative bg-gradient-to-br from-primary via-secondary to-accent rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative flex flex-col lg:flex-row items-center min-h-[500px] lg:min-h-[400px]">
              {/* Content */}
              <div className="flex-1 p-8 lg:p-12 text-white">
                <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                  Fresh Seafood Delivered to Your Door
                </h1>
                <p className="text-lg lg:text-xl text-light mb-8 max-w-2xl">
                  Experience the finest seafood, sourced daily and delivered fresh to your home. From succulent salmon to plump 
                  shrimp, we bring the ocean's best to your table.
                </p>
                <Link 
                  to="/products"
                  className="bg-button text-white hover:bg-primary font-semibold py-3 px-8 rounded-lg transition-all duration-300 inline-flex items-center group hover-lift btn-gradient-primary"
                >
                  Shop Now
                  <ChevronRightIcon className="h-5 w-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
              
              {/* Seafood Image */}
              <div className="flex-1 p-4 lg:p-8">
                <div className="relative">
                  {/* Main Seafood Platter */}
                  <div className="bg-gradient-to-br from-accent to-secondary rounded-full w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 mx-auto relative overflow-hidden shadow-2xl hover-scale transition-smooth animate-float">
                    <div className="absolute inset-3 sm:inset-4 bg-gradient-to-br from-light to-background rounded-full flex items-center justify-center">
                      <div className="text-4xl sm:text-6xl lg:text-8xl animate-bounce-gentle">🦐🐟🦪</div>
                    </div>
                    
                    {/* Floating seafood elements */}
                    <div className="absolute top-4 sm:top-8 right-4 sm:right-8 text-2xl sm:text-4xl animate-bounce">🦐</div>
                    <div className="absolute bottom-8 sm:bottom-12 left-4 sm:left-8 text-2xl sm:text-4xl animate-bounce" style={{animationDelay: '0.5s'}}>🐟</div>
                    <div className="absolute top-8 sm:top-16 left-6 sm:left-12 text-xl sm:text-3xl animate-bounce" style={{animationDelay: '1s'}}>🦪</div>
                    <div className="absolute bottom-4 sm:bottom-8 right-6 sm:right-12 text-xl sm:text-3xl animate-bounce" style={{animationDelay: '1.5s'}}>🦀</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-12 lg:py-16 bg-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 lg:mb-8 text-center lg:text-left">Featured Products</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Wild Caught Salmon */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover-lift group">
              <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="w-32 h-24 bg-gradient-to-br from-orange-200 to-orange-300 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <span className="text-4xl animate-bounce-gentle">🐟</span>
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  Fresco
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300">Wild Caught Salmon</h3>
                <p className="text-gray-600 text-sm mb-4">Sustainably sourced, rich in flavor</p>
                <button className="w-full bg-button hover:bg-primary text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 hover-lift btn-gradient-primary group">
                  <span className="group-hover:scale-105 transition-transform duration-300 inline-block">Add to Cart</span>
                </button>
              </div>
            </div>

            {/* Live Maine Lobster */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover-lift group">
              <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="w-32 h-24 bg-gradient-to-br from-red-200 to-red-300 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <span className="text-4xl animate-bounce-gentle" style={{animationDelay: '0.2s'}}>🦞</span>
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-1 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}>
                  Live
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300">Live Maine Lobster</h3>
                <p className="text-gray-600 text-sm mb-4">Delivered live for ultimate freshness</p>
                <button className="w-full bg-button hover:bg-primary text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 hover-lift btn-gradient-primary group">
                  <span className="group-hover:scale-105 transition-transform duration-300 inline-block">Add to Cart</span>
                </button>
              </div>
            </div>

            {/* Premium Oysters */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover-lift group">
              <div className="h-48 bg-gradient-to-br from-secondary to-accent relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="w-32 h-24 bg-gradient-to-br from-gray-200 to-light rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                    <span className="text-4xl animate-bounce-gentle" style={{animationDelay: '0.4s'}}>🦪</span>
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-light text-primary text-xs px-2 py-1 rounded-full animate-pulse font-semibold" style={{animationDelay: '0.7s'}}>
                  Premium
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors duration-300">Premium Oysters</h3>
                <p className="text-gray-600 text-sm mb-4">Harvested daily, briny and delicious</p>
                <button className="w-full bg-button hover:bg-primary text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 hover-lift btn-gradient-primary group">
                  <span className="group-hover:scale-105 transition-transform duration-300 inline-block">Add to Cart</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-6 lg:mb-8 text-center lg:text-left">Special Offers</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Summer Seafood Feast */}
            <div className="relative bg-gray-100 rounded-2xl overflow-hidden">
              <div className="h-48 sm:h-56 lg:h-64 bg-gradient-to-br from-accent to-secondary relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white px-4">
                    <div className="text-4xl sm:text-5xl lg:text-6xl mb-2 lg:mb-4">🍽️🦐🐟</div>
                    <div className="text-xs text-light">SUMMER SPECIAL</div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Summer Seafood Feast</h3>
                <p className="text-gray-600 text-sm">Enjoy 20% off on selected seafood bundles</p>
              </div>
            </div>

            {/* Holiday Seafood Specials */}
            <div className="relative bg-gray-100 rounded-2xl overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-gray-700 to-gray-900 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">🎉🦞🦪</div>
                    <div className="text-xs text-gray-300">HOLIDAY SPECIAL</div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Holiday Seafood Specials</h3>
                <p className="text-gray-600 text-sm">Celebrate with our festive seafood selections</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 lg:py-16 bg-light">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-gray-600 mb-6 lg:mb-8 text-sm sm:text-base">Stay updated on the latest catches, exclusive offers, and delicious recipes.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="w-full sm:flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-accent hover:shadow-md"
            />
            <button className="w-full sm:w-auto bg-button hover:bg-primary text-white font-semibold py-3 px-6 lg:px-8 rounded-lg transition-all duration-300 whitespace-nowrap hover-lift btn-gradient-primary group">
              <span className="group-hover:scale-105 transition-transform duration-300 inline-block">Subscribe</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
