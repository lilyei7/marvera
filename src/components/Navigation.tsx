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
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center lg:justify-between items-center h-16 sm:h-18 lg:h-20">
            
            {/* Logo centrado en móvil, izquierda en desktop */}
            <div className="flex-shrink-0 lg:flex-none absolute left-1/2 transform -translate-x-1/2 lg:relative lg:left-auto lg:transform-none">
              <Link to="/" className="flex items-center group">
                <div className="relative">
                  <img
                    className="h-12 w-auto sm:h-14 md:h-16 lg:h-14 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg filter drop-shadow-md mx-auto"
                    src="/logomarvera.png"
                    alt="MarVera"
                  />
                  {/* Efecto de ondas del logo solo en desktop */}
                  <div className="hidden lg:block absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                  {/* Brillo marino solo en desktop */}
                  <div className="hidden lg:block absolute -inset-2 bg-gradient-to-r from-blue-500/10 via-teal-500/15 to-blue-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                </div>
                {/* Texto del logo solo en desktop */}
                <div className="hidden lg:block ml-3">
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                    MarVera
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8">
              <div className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 lg:h-6 lg:w-6 text-muted group-focus-within:text-primary transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar mariscos frescos..."
                  className="block w-full pl-10 lg:pl-12 pr-3 py-2.5 lg:py-3 text-base lg:text-lg border border-default rounded-lg leading-5 bg-background placeholder-muted focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-accent hover:shadow-md text-main"
                />
              </div>
            </div>

            {/* Right Menu - Solo visible en desktop */}
            <div className="hidden lg:flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              
              {/* User Menu con efectos marinos mejorados */}
              <div className="relative">
                {isAuthenticated && user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-1 lg:space-x-2 text-main hover:text-primary px-3 sm:px-4 lg:px-5 py-2.5 lg:py-3 rounded-xl transition-all duration-300 group border-2 border-transparent hover:border-primary/30 hover:shadow-lg"
                    >
                      <UserIcon className="h-6 w-6 lg:h-7 lg:w-7 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                      <span className="hidden lg:block font-semibold text-base text-gray-700 group-hover:text-primary">
                        {user.firstName}
                      </span>
                      <div className="hidden lg:block w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl py-2 z-50 border border-gray-200/50 ring-1 ring-black/5">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-900">¡Hola, {user.firstName}! 👋</p>
                          <p className="text-xs text-gray-500 mt-1">Bienvenido a MarVera</p>
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 transition-all duration-200 rounded-lg mx-2 group"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <span className="mr-3 text-lg group-hover:scale-110 transition-transform">👤</span>
                          <span className="font-medium">Mi Perfil</span>
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 transition-all duration-200 rounded-lg mx-2 group"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <span className="mr-3 text-lg group-hover:scale-110 transition-transform">📦</span>
                          <span className="font-medium">Mis Pedidos</span>
                        </Link>
                        <hr className="my-2 mx-2 border-gray-100" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 rounded-lg mx-2 group"
                        >
                          <span className="mr-3 text-lg group-hover:scale-110 transition-transform">🚪</span>
                          <span className="font-medium">Cerrar Sesión</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center space-x-1 text-main hover:text-primary px-3 sm:px-4 lg:px-5 py-2.5 lg:py-3 rounded-xl transition-all duration-300 group border-2 border-transparent hover:border-primary/30 hover:shadow-lg"
                    disabled={isLoading}
                  >
                    <UserIcon className="h-6 w-6 lg:h-7 lg:w-7 transition-all duration-300 group-hover:scale-110 group-hover:text-primary" />
                    <span className="hidden xl:block font-semibold text-base text-gray-700 group-hover:text-primary">
                      {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
                    </span>
                    {isLoading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
                  </button>
                )}
              </div>

              {/* Cart con diseño premium elegante */}
              <button
                onClick={handleCartClick}
                className="relative flex items-center space-x-2 text-main hover:text-primary px-4 lg:px-6 py-3 lg:py-3.5 rounded-2xl bg-white/80 hover:bg-white transition-all duration-300 group border-2 border-gray-200/50 hover:border-primary/40 hover:shadow-xl backdrop-blur-sm"
              >
                <div className="relative">
                  <div className="relative p-2 rounded-xl bg-gradient-to-br from-primary/5 to-accent/10 group-hover:from-primary/10 group-hover:to-accent/20 transition-all duration-300">
                    <ShoppingCartIcon className="h-6 w-6 lg:h-7 lg:w-7 transition-all duration-300 group-hover:scale-105 text-primary" />
                    
                    {/* Efecto de resplandor sutil */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300 blur-sm -z-10"></div>
                  </div>
                  
                  {itemCount > 0 && (
                    <>
                      {/* Badge principal mejorado */}
                      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full min-w-[24px] h-6 flex items-center justify-center font-bold text-xs shadow-lg group-hover:scale-110 transition-transform duration-300 z-20 border-2 border-white">
                        {itemCount > 99 ? '99+' : itemCount}
                      </div>
                      
                      {/* Anillo pulsante sutil */}
                      <div className="absolute -top-1 -right-1 min-w-[24px] h-6 bg-red-400/60 rounded-full animate-ping"></div>
                    </>
                  )}
                </div>
                
                <div className="hidden lg:flex flex-col items-start">
                  <span className="font-semibold text-sm text-gray-700 group-hover:text-primary transition-colors duration-300">
                    Carrito
                  </span>
                  {itemCount > 0 && (
                    <span className="text-xs text-red-500 font-medium">
                      {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-2 sm:px-4 pb-3">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-muted group-focus-within:text-primary transition-colors duration-200" />
            </div>
            <input
              type="text"
              placeholder="Buscar mariscos..."
              className="block w-full pl-10 pr-3 py-3 text-base border border-default rounded-lg leading-5 bg-background placeholder-muted focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-accent hover:shadow-md text-main"
            />
          </div>
        </div>

        {/* Categories Menu - Solo visible en desktop, oculto en móvil */}
        <div className="hidden md:block bg-light border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 py-4 overflow-x-auto">
              <Link
                to="/products"
                className="text-base sm:text-lg text-gray-600 hover:text-primary font-medium whitespace-nowrap transition-colors duration-200 hover:underline py-2"
              >
                Comprar en línea
              </Link>
              <Link
                to="/products?category=pescados-frescos"
                className="text-base sm:text-lg text-gray-600 hover:text-primary font-medium whitespace-nowrap transition-colors duration-200 hover:underline py-2"
              >
                Sucursales
              </Link>
              <Link
                to="/products?category=mariscos"
                className="text-base sm:text-lg text-gray-600 hover:text-primary font-medium whitespace-nowrap transition-colors duration-200 hover:underline py-2"
              >
                Mayoreo
              </Link>
              <Link
                to="/products?category=crustaceos"
                className="text-base sm:text-lg text-gray-600 hover:text-primary font-medium whitespace-nowrap transition-colors duration-200 hover:underline py-2"
              >
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Solo visible en móvil con FontAwesome */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 mobile-bottom-nav">
        <div className="grid grid-cols-5 h-16">
          {/* Tienda */}
          <Link
            to="/products"
            className="mobile-bottom-nav-item flex flex-col items-center justify-center space-y-1 text-gray-600 hover:text-primary relative z-10"
          >
            <i className="mobile-nav-icon fas fa-store"></i>
            <span className="text-xs font-medium">Tienda</span>
          </Link>

          {/* Sucursales */}
          <Link
            to="/sucursales"
            className="mobile-bottom-nav-item flex flex-col items-center justify-center space-y-1 text-gray-600 hover:text-primary relative z-10"
          >
            <i className="mobile-nav-icon fas fa-map-marker-alt"></i>
            <span className="text-xs font-medium">Sucursales</span>
          </Link>

          {/* Carrito - Diseño circular minimalista */}
          <button
            onClick={handleCartClick}
            className="mobile-bottom-nav-item relative flex flex-col items-center justify-center space-y-1 z-20"
            style={{ overflow: 'visible' }}
          >
            <div className="mobile-cart-container-minimal">
              <div className={`mobile-cart-circle-minimal ${itemCount > 0 ? 'cart-animate-minimal' : ''} relative`}>
                {/* Icono del carrito */}
                <i className="mobile-nav-icon-cart-minimal fas fa-shopping-cart"></i>
                
                {/* Badge de número minimalista */}
                {itemCount > 0 && (
                  <span className="mobile-cart-badge-minimal">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* Mayoreo */}
          <Link
            to="/mayoreo"
            className="mobile-bottom-nav-item flex flex-col items-center justify-center space-y-1 text-gray-600 hover:text-primary relative z-10"
          >
            <i className="mobile-nav-icon fas fa-building"></i>
            <span className="text-xs font-medium">Mayoreo</span>
          </Link>

          {/* Perfil/Login */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="mobile-bottom-nav-item w-full flex flex-col items-center justify-center space-y-1 text-gray-600 hover:text-primary relative z-10"
              >
                <i className="mobile-nav-icon fas fa-user"></i>
                <span className="text-xs font-medium truncate max-w-12">{user.firstName}</span>
              </button>

              {/* Mobile User Menu */}
              {showUserMenu && (
                <div className="mobile-user-menu absolute bottom-full right-0 mb-2 w-48 rounded-xl py-2 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-light transition-colors duration-200 rounded-lg mx-2"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <i className="fas fa-user-circle mr-3 text-lg"></i>
                    Mi Perfil
                  </Link>
                  <Link
                    to="/orders"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-light transition-colors duration-200 rounded-lg mx-2"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <i className="fas fa-box mr-3 text-lg"></i>
                    Mis Pedidos
                  </Link>
                  <hr className="my-2 mx-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 rounded-lg mx-2"
                  >
                    <i className="fas fa-sign-out-alt mr-3 text-lg"></i>
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="mobile-bottom-nav-item flex flex-col items-center justify-center space-y-1 text-gray-600 hover:text-primary relative z-10"
              disabled={isLoading}
            >
              <i className={`mobile-nav-icon fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-key'}`}></i>
              <span className="text-xs font-medium">
                {isLoading ? 'Cargando...' : 'Login'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;