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
      <nav className="bg-card shadow-lg border-b border-default sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo - Solo marveralogo.png */}
            <Link to="/" className="flex items-center space-x-1 sm:space-x-2 group flex-shrink-0">
              {/* Logo real de MarVera - SOLO IMAGEN */}
              <img 
                src="/logomarvera.png" 
                alt="MarVera - Pescados y Mariscos" 
                className="h-8 w-auto sm:h-10 sm:w-auto lg:h-12 lg:w-auto max-w-[120px] sm:max-w-[150px] lg:max-w-[180px] object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            {/* Barra de búsqueda - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-sm lg:max-w-lg mx-4 lg:mx-8">
              <div className="relative group w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-4 w-4 lg:h-5 lg:w-5 text-muted group-focus-within:text-primary transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar mariscos..."
                  className="block w-full pl-8 lg:pl-10 pr-3 py-2 text-sm border border-default rounded-lg leading-5 bg-background placeholder-muted focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-accent hover:shadow-md text-main"
                />
              </div>
            </div>

            {/* Menú derecha */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
              {/* Usuario */}
              <div className="relative">
                {isAuthenticated && user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-1 lg:space-x-2 text-main hover:text-primary px-2 sm:px-3 lg:px-4 py-2 rounded-lg hover:bg-light hover:bg-opacity-50 transition-all duration-200 group border border-transparent hover:border-primary"
                    >
                      <UserIcon className="h-5 w-5 lg:h-6 lg:w-6 transition-transform duration-200 group-hover:scale-110" />
                      <span className="hidden lg:block font-medium text-sm">{user.firstName}</span>
                    </button>
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-card rounded-md shadow-lg py-1 z-50 border border-default animate-fade-in">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-main hover:bg-light hover:bg-opacity-50 transition-colors duration-200"
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
                    className="flex items-center space-x-1 text-main hover:text-primary px-2 sm:px-3 lg:px-4 py-2 rounded-lg hover:bg-light hover:bg-opacity-50 transition-all duration-200 group border border-transparent hover:border-primary"
                    disabled={isLoading}
                  >
                    <UserIcon className="h-5 w-5 lg:h-6 lg:w-6 transition-transform duration-200 group-hover:scale-110" />
                    <span className="hidden xl:block font-medium text-sm">
                      {isLoading ? 'Verificando...' : 'Login'}
                    </span>
                  </button>
                )}
              </div>

                {/* Modo oscuro */}
              {/* Carrito */}
              <button
                onClick={handleCartClick}
                className="relative flex items-center space-x-1 text-main hover:text-primary px-2 sm:px-3 lg:px-4 py-2 rounded-lg hover:bg-light hover:bg-opacity-50 transition-all duration-200 group border border-transparent hover:border-primary hover:shadow-md"
              >
                <ShoppingCartIcon className="h-5 w-5 lg:h-6 lg:w-6 transition-transform duration-200 group-hover:scale-110" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center font-bold animate-pulse group-hover:animate-bounce text-xs">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
                <span className="hidden lg:block font-medium text-sm">Carrito</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-2 sm:px-4 pb-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 text-muted group-focus-within:text-primary transition-colors duration-200" />
            </div>
            <input
              type="text"
              placeholder="Buscar mariscos..."
              className="block w-full pl-9 pr-3 py-2 text-sm border border-default rounded-lg leading-5 bg-background placeholder-muted focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-accent hover:shadow-md text-main"
            />
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
                Comprar en linea
              </Link>
              <Link
                to="/products?category=pescados-frescos"
                className="text-sm text-gray-600 hover:text-primary font-medium whitespace-nowrap transition-colors duration-200 hover:underline"
              >
                Sucursales
              </Link>
              <Link
                to="/products?category=mariscos"
                className="text-sm text-gray-600 hover:text-primary font-medium whitespace-nowrap transition-colors duration-200 hover:underline"
              >
                Empresa
              </Link>
              <Link
                to="/products?category=crustaceos"
                className="text-sm text-gray-600 hover:text-primary font-medium whitespace-nowrap transition-colors duration-200 hover:underline"
              >
                Contacto
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
