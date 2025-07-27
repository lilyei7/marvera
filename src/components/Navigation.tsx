import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleCart } from '../store/slices/cartSlice';
import { verifyToken, logoutUser } from '../store/slices/authSlice';
import AuthModal from './AuthModal';

const Navigation: React.FC = () => {
  const dispatch = useAppDispatch();
  const cartState = useAppSelector((state: any) => state.cart);
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);
  const itemCount = cartState?.itemCount || 0;
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    dispatch(verifyToken());
  }, [dispatch]);

  const handleCartClick = () => {
    dispatch(toggleCart());
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setShowUserMenu(false);
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="text-2xl font-bold text-primary transition-transform duration-300 group-hover:scale-110">
                🌊 MarVera
              </div>
            </Link>

            {/* Barra de búsqueda */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar mariscos frescos..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-accent hover:shadow-md"
                />
              </div>
            </div>

            {/* Menú derecha */}
            <div className="flex items-center space-x-4">
              {/* Usuario */}
              <div className="relative">
                {isAuthenticated && user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-primary px-4 py-2 rounded-lg hover:bg-light transition-all duration-200 group border border-transparent hover:border-primary"
                    >
                      <UserIcon className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                      <span className="hidden md:block font-medium">{user.firstName}</span>
                    </button>
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100 animate-fade-in">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-light transition-colors duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Mi Perfil
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-light transition-colors duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Mis Pedidos
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-primary hover:bg-primary hover:text-white transition-colors duration-200 font-medium"
                            onClick={() => setShowUserMenu(false)}
                          >
                            👨‍💼 Panel Admin
                          </Link>
                        )}
                        <hr className="my-1" />
                        <Link
                          to="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-light transition-colors duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Configuración
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-light transition-colors duration-200"
                        >
                          Cerrar Sesión
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center space-x-1 text-gray-700 hover:text-primary px-4 py-2 rounded-lg hover:bg-light transition-all duration-200 group border border-transparent hover:border-primary"
                    disabled={isLoading}
                  >
                    <UserIcon className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                    <span className="hidden md:block font-medium">
                      {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
                    </span>
                  </button>
                )}
              </div>

              {/* Carrito */}
              <button
                onClick={handleCartClick}
                className="relative flex items-center space-x-1 text-gray-700 hover:text-primary px-4 py-2 rounded-lg hover:bg-light transition-all duration-200 group border border-transparent hover:border-primary hover:shadow-md"
              >
                <ShoppingCartIcon className="h-6 w-6 transition-transform duration-200 group-hover:scale-110" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold animate-pulse group-hover:animate-bounce">
                    {itemCount}
                  </span>
                )}
                <span className="hidden md:block font-medium">Carrito</span>
              </button>
            </div>
          </div>
        </div>

        {/* Menú de categorías */}
        <div className="bg-light border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 py-3 overflow-x-auto">
              <Link
                to="/products"
                className="text-sm text-gray-600 hover:text-primary font-medium whitespace-nowrap transition-colors duration-200 hover:underline"
              >
                Todos los Productos
              </Link>
              <Link
                to="/products?category=pescados-frescos"
                className="text-sm text-gray-600 hover:text-primary font-medium whitespace-nowrap transition-colors duration-200 hover:underline"
              >
                Pescados Frescos
              </Link>
              <Link
                to="/products?category=mariscos"
                className="text-sm text-gray-600 hover:text-primary font-medium whitespace-nowrap transition-colors duration-200 hover:underline"
              >
                Mariscos
              </Link>
              <Link
                to="/products?category=crustaceos"
                className="text-sm text-gray-600 hover:text-primary font-medium whitespace-nowrap transition-colors duration-200 hover:underline"
              >
                Crustáceos
              </Link>
              <Link
                to="/products?category=moluscos"
                className="text-sm text-gray-600 hover:text-primary font-medium whitespace-nowrap transition-colors duration-200 hover:underline"
              >
                Moluscos
              </Link>
              <Link
                to="/products?category=premium"
                className="text-sm text-gray-600 hover:text-primary font-medium whitespace-nowrap transition-colors duration-200 hover:underline"
              >
                Premium
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Modal de autenticación */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Navigation;
