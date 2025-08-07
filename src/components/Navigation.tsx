import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { MagnifyingGlassIcon, ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleCart } from '../store/slices/cartSlice';
import { verifyToken, logoutUser } from '../store/slices/authSlice';
import DevModeIndicator from './common/DevModeIndicator';
import { FRONTEND_ROUTES, buildFrontendUrl } from '../config/routes';

const Navigation: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cartState = useAppSelector((state: any) => state.cart);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const itemCount = cartState?.itemCount || 0;

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado y referencias para la animación de burbuja en móvil
  const [, setActiveNavIndex] = useState(0);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const navLinkRefs = useRef<(HTMLDivElement | null)[]>([]);
  const location = useLocation();

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

  // Función para crear efecto ripple al hacer click
  const createRipple = (event: React.MouseEvent, element: HTMLElement) => {
    const button = element;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('nav-ripple');
    
    const ripple = button.getElementsByClassName('nav-ripple')[0];
    if (ripple) {
      ripple.remove();
    }
    
    button.appendChild(circle);
    
    // Remover el ripple después de la animación
    setTimeout(() => {
      circle.remove();
    }, 600);
  };

  // Función para animar la burbuja en navegación móvil con efectos de fluido épicos
  const moveBubble = (index: number) => {
    setActiveNavIndex(index);
    const navElement = navLinkRefs.current[index];
    if (navElement && bubbleRef.current) {
      const left = navElement.offsetLeft + (navElement.offsetWidth / 2) - 50; // Centrar la burbuja más grande
      
      // FASE 1: Preparar animación - burbuja se encoge y se prepara para saltar
      bubbleRef.current.style.transition = 'transform 0.15s ease-in';
      bubbleRef.current.style.transform = `translateX(${bubbleRef.current.offsetLeft}px) scale(0.8, 1.2)`;
      
      setTimeout(() => {
        if (bubbleRef.current) {
          // FASE 2: Movimiento fluido con overshoot épico
          bubbleRef.current.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
          bubbleRef.current.style.transform = `translateX(${left}px) scale(1.3, 0.7)`;
          
          // FASE 3: Rebote elástico final
          setTimeout(() => {
            if (bubbleRef.current) {
              bubbleRef.current.style.transition = 'transform 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)';
              bubbleRef.current.style.transform = `translateX(${left}px) scale(1)`;
            }
          }, 200);
        }
      }, 150);
    }
  };

  // Detectar ruta activa para posicionar la burbuja inicial
  useEffect(() => {
    const currentPath = location.pathname;
    let initialIndex = 0;
    
    if (currentPath.includes('productos')) initialIndex = 0;
    else if (currentPath.includes('sucursales')) initialIndex = 1;
    else if (currentPath.includes('mayoreo')) initialIndex = 3;
    else if (currentPath.includes('login') || currentPath.includes('profile')) initialIndex = 4;
    
    // Mover burbuja a posición inicial con delay para permitir render
    setTimeout(() => moveBubble(initialIndex), 100);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Navegar a la página de productos con el término de búsqueda usando rutas centralizadas
      navigate(buildFrontendUrl(FRONTEND_ROUTES.PRODUCTS, { search: searchTerm.trim() }));
      setSearchTerm(''); // Limpiar el campo después de la búsqueda
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between items-center h-16 xs:h-18 sm:h-20 lg:h-20">
            
            {/* Logo - Centrado en móvil, izquierda en desktop */}
            <div className="flex-shrink-0 min-w-0 lg:flex-none w-full lg:w-auto flex justify-center lg:justify-start">
              <Link to={FRONTEND_ROUTES.HOME} className="flex items-center group">
                <div className="relative">
                  <img
                    className="h-14 w-auto xs:h-16 sm:h-18 md:h-20 lg:h-12 xl:h-14 max-w-none transition-all duration-300 group-hover:scale-105 filter drop-shadow-sm"
                    src="/logomarvera.png"
                    alt="MarVera"
                    style={{ maxWidth: 'none' }}
                  />
                </div>
                {/* Texto del logo solo en pantallas grandes */}
                <div className="hidden xl:block ml-2 min-w-0">
                  <span className="text-lg xl:text-2xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent whitespace-nowrap">
                    MarVera
                  </span>
                </div>
              </Link>
            </div>

            {/* Search Bar Central - Solo desktop */}
            <div className="hidden lg:flex flex-1 max-w-md xl:max-w-2xl mx-4 xl:mx-8">
              <form onSubmit={handleSearch} className="relative w-full group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-4 w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 text-muted group-focus-within:text-primary transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchInputChange}
                  placeholder="Buscar mariscos frescos..."
                  className="block w-full pl-9 lg:pl-10 xl:pl-12 pr-3 py-2 lg:py-2.5 xl:py-3 text-sm lg:text-base xl:text-lg border border-default rounded-lg leading-5 bg-background placeholder-muted focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 hover:border-accent hover:shadow-md text-main"
                />
              </form>
            </div>

            {/* Right Menu - Desktop */}
            <div className="hidden lg:flex items-center space-x-2 xl:space-x-4 flex-shrink-0">
              
              {/* User Menu Desktop */}
              <div className="relative">
                {isAuthenticated && user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-1 xl:space-x-2 text-main hover:text-primary px-2 xl:px-4 py-2 xl:py-2.5 rounded-lg xl:rounded-xl transition-all duration-300 group border border-transparent hover:border-primary/30 hover:shadow-md"
                    >
                      <UserIcon className="h-5 w-5 xl:h-6 xl:w-6 transition-all duration-300 group-hover:scale-105" />
                      <span className="hidden xl:block font-medium text-sm xl:text-base text-gray-700 group-hover:text-primary whitespace-nowrap">
                        {user.firstName}
                      </span>
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 xl:w-56 bg-white rounded-lg xl:rounded-xl shadow-xl py-2 z-50 border border-gray-200">
                        <div className="px-3 xl:px-4 py-2 xl:py-3 border-b border-gray-100">
                          <p className="text-xs xl:text-sm font-semibold text-gray-900">¡Hola, {user.firstName}! 👋</p>
                          <p className="text-xs text-gray-500 mt-1">Bienvenido a MarVera</p>
                        </div>
                        <Link
                          to="/profile"
                          className="flex items-center px-3 xl:px-4 py-2 xl:py-3 text-xs xl:text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <span className="mr-2 xl:mr-3">👤</span>
                          <span>Mi Perfil</span>
                        </Link>
                        <Link
                          to="/orders"
                          className="flex items-center px-3 xl:px-4 py-2 xl:py-3 text-xs xl:text-sm text-gray-700 hover:bg-blue-50 transition-colors duration-200"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <span className="mr-2 xl:mr-3">📦</span>
                          <span>Mis Pedidos</span>
                        </Link>
                        <hr className="my-1 xl:my-2 mx-2 border-gray-100" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-3 xl:px-4 py-2 xl:py-3 text-xs xl:text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <span className="mr-2 xl:mr-3">🚪</span>
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="flex items-center space-x-1 text-main hover:text-primary px-2 xl:px-4 py-2 xl:py-2.5 rounded-lg xl:rounded-xl transition-all duration-300 group border border-transparent hover:border-primary/30 hover:shadow-md"
                  >
                    <UserIcon className="h-5 w-5 xl:h-6 xl:w-6 transition-all duration-300 group-hover:scale-105" />
                    <span className="hidden xl:block font-medium text-sm xl:text-base text-gray-700 group-hover:text-primary whitespace-nowrap">
                      Iniciar Sesión
                    </span>
                  </Link>
                )}
              </div>

              {/* Cart Desktop */}
              <button
                onClick={handleCartClick}
                className="relative flex items-center space-x-1 xl:space-x-2 text-main hover:text-primary px-2 xl:px-4 py-2 xl:py-2.5 rounded-lg xl:rounded-xl bg-white hover:bg-gray-50 transition-all duration-300 group border border-gray-200 hover:border-primary/40 hover:shadow-md"
              >
                <div className="relative">
                  <ShoppingCartIcon className="h-5 w-5 xl:h-6 xl:w-6 transition-all duration-300 group-hover:scale-105 text-primary" />
                  
                  {itemCount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full min-w-[18px] xl:min-w-[20px] h-4 xl:h-5 flex items-center justify-center font-bold text-xs shadow-lg">
                      {itemCount > 99 ? '99+' : itemCount}
                    </div>
                  )}
                </div>
                
                {/* Texto del carrito eliminado para diseño más minimalista */}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar - Más grande y centrado */}
        <div className="lg:hidden border-t border-gray-100 px-3 xs:px-4 sm:px-6 py-4 xs:py-5 bg-gray-50">
          <form onSubmit={handleSearch} className="relative group max-w-md mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-6 w-6 xs:h-7 xs:w-7 text-muted group-focus-within:text-primary transition-colors duration-200" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchInputChange}
              placeholder="Buscar mariscos frescos..."
              className="block w-full pl-14 xs:pl-16 pr-4 py-4 xs:py-5 text-lg xs:text-xl border border-gray-300 rounded-xl bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:bg-white transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
            />
          </form>
        </div>

        {/* Categories Menu - Solo visible en desktop */}
        <div className="hidden lg:block bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 xl:px-8">
            <div className="flex space-x-6 xl:space-x-8 py-3 xl:py-4 overflow-x-auto">
              <Link
                to={FRONTEND_ROUTES.PRODUCTS}
                className="text-sm xl:text-base text-gray-600 hover:text-primary font-medium whitespace-nowrap transition-colors duration-200 hover:underline py-1 xl:py-2"
              >
                Comprar en línea
              </Link>
              <Link
                to="/mayoreo"
                className="text-sm xl:text-base text-gray-600 hover:text-primary font-medium whitespace-nowrap transition-colors duration-200 hover:underline py-1 xl:py-2"
              >
                Mayoreo
              </Link>
              <Link
                to="/sucursales"
                className="text-sm xl:text-base text-gray-600 hover:text-primary font-medium whitespace-nowrap transition-colors duration-200 hover:underline py-1 xl:py-2"
              >
                Sucursales
              </Link>
              <Link
                to="/contacto"
                className="text-sm xl:text-base text-gray-600 hover:text-primary font-medium whitespace-nowrap transition-colors duration-200 hover:underline py-1 xl:py-2"
              >
                Contacto
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation con animación de burbuja fluida */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="relative grid grid-cols-5 h-18 xs:h-20">
          
          {/* Burbuja animada de fondo con efectos épicos */}
          <div className="absolute bottom-1 left-0 pointer-events-none">
            {/* Burbuja principal con gradiente y sombras múltiples */}
            <div 
              ref={bubbleRef}
              className="w-24 h-16 xs:w-28 xs:h-18 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(59, 130, 246, 0.15) 50%, rgba(30, 58, 138, 0.1) 100%)',
                boxShadow: `
                  0 0 30px rgba(30, 58, 138, 0.4),
                  0 0 60px rgba(30, 58, 138, 0.2),
                  inset 0 2px 10px rgba(255, 255, 255, 0.3),
                  inset 0 -2px 10px rgba(30, 58, 138, 0.2)
                `,
                border: '1px solid rgba(30, 58, 138, 0.3)',
                transition: 'transform 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
                zIndex: 0,
                filter: 'blur(0.5px)'
              }}
            />
            
            {/* Efectos de partículas que salpican */}
            <div 
              className="absolute top-1 left-2 w-3 h-3 bg-primary/20 rounded-full"
              style={{
                animation: 'float 2s ease-in-out infinite',
                filter: 'blur(1px)'
              }}
            />
            <div 
              className="absolute top-2 right-3 w-2 h-2 bg-blue-400/30 rounded-full"
              style={{
                animation: 'float 1.5s ease-in-out infinite reverse',
                filter: 'blur(0.5px)'
              }}
            />
            <div 
              className="absolute bottom-1 left-1/2 w-4 h-4 bg-primary/10 rounded-full"
              style={{
                animation: 'pulse 3s ease-in-out infinite',
                transform: 'translateX(-50%)',
                filter: 'blur(2px)'
              }}
            />
          </div>

          {/* Productos */}
          <div 
            ref={(el) => { navLinkRefs.current[0] = el; }}
            className="relative z-10 nav-item"
          >
            <Link
              to={FRONTEND_ROUTES.PRODUCTS}
              onClick={(e) => {
                createRipple(e, e.currentTarget);
                moveBubble(0);
              }}
              className="flex flex-col items-center justify-center space-y-2 text-gray-600 hover:text-primary transition-all duration-300 h-full relative"
            >
              <MagnifyingGlassIcon className="h-6 w-6 xs:h-7 xs:w-7 transform transition-transform hover:scale-110" />
              <span className="text-xs xs:text-sm font-medium">Productos</span>
            </Link>
          </div>

          {/* Sucursales */}
          <div 
            ref={(el) => { navLinkRefs.current[1] = el; }}
            className="relative z-10 nav-item"
          >
            <Link
              to="/sucursales"
              onClick={(e) => {
                createRipple(e, e.currentTarget);
                moveBubble(1);
              }}
              className="flex flex-col items-center justify-center space-y-2 text-gray-600 hover:text-primary transition-all duration-300 h-full relative"
            >
              <svg className="h-6 w-6 xs:h-7 xs:w-7 transform transition-transform hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs xs:text-sm font-medium">Sucursales</span>
            </Link>
          </div>

          {/* Carrito - CENTRO con círculo especial (mantiene su diseño único pero con efectos) */}
          <div 
            ref={(el) => { navLinkRefs.current[2] = el; }}
            className="relative z-10 nav-item"
          >
            <button
              onClick={(e) => {
                createRipple(e, e.currentTarget);
                handleCartClick();
                moveBubble(2);
              }}
              className="relative flex items-center justify-center h-full"
            >
              <div className="relative bg-primary hover:bg-primary/90 w-14 h-14 xs:w-16 xs:h-16 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 active:scale-95 hover:scale-110 hover:shadow-xl">
                <ShoppingCartIcon className="h-7 w-7 xs:h-8 xs:w-8 text-white" />
                {itemCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full min-w-[18px] xs:min-w-[20px] h-4 xs:h-5 flex items-center justify-center font-bold text-xs xs:text-sm animate-pulse">
                    {itemCount > 9 ? '9+' : itemCount}
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Mayoreo */}
          <div 
            ref={(el) => { navLinkRefs.current[3] = el; }}
            className="relative z-10 nav-item"
          >
            <Link
              to="/mayoreo"
              onClick={(e) => {
                createRipple(e, e.currentTarget);
                moveBubble(3);
              }}
              className="flex flex-col items-center justify-center space-y-2 text-gray-600 hover:text-primary transition-all duration-300 h-full relative"
            >
              <svg className="h-6 w-6 xs:h-7 xs:w-7 transform transition-transform hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M9 1v6m6-6v6" />
              </svg>
              <span className="text-xs xs:text-sm font-medium">Mayoreo</span>
            </Link>
          </div>

          {/* Usuario */}
          <div 
            ref={(el) => { navLinkRefs.current[4] = el; }}
            className="relative z-10 nav-item"
          >
            {isAuthenticated && user ? (
              <>
                <button
                  onClick={(e) => {
                    createRipple(e, e.currentTarget);
                    setShowUserMenu(!showUserMenu);
                    moveBubble(4);
                  }}
                  className="w-full flex flex-col items-center justify-center space-y-2 text-gray-600 hover:text-primary transition-all duration-300 h-full relative"
                >
                  <UserIcon className="h-6 w-6 xs:h-7 xs:w-7 transform transition-transform hover:scale-110" />
                  <span className="text-xs xs:text-sm font-medium truncate max-w-12">{user.firstName}</span>
                </button>

                {/* Mobile User Menu */}
                {showUserMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 xs:w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="mr-3 text-lg">👤</span>
                      Mi Perfil
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center px-4 py-3 text-base text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="mr-3 text-lg">📦</span>
                      Mis Pedidos
                    </Link>
                    <hr className="my-1 mx-2 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 text-base text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <span className="mr-3 text-lg">🚪</span>
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                to="/login"
                onClick={(e) => {
                  createRipple(e, e.currentTarget);
                  moveBubble(4);
                }}
                className="flex flex-col items-center justify-center space-y-2 text-gray-600 hover:text-primary transition-all duration-300 h-full relative"
              >
                <UserIcon className="h-6 w-6 xs:h-7 xs:w-7 transform transition-transform hover:scale-110" />
                <span className="text-xs xs:text-sm font-medium">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Spacer para bottom navigation en móvil */}
      <div className="lg:hidden h-18 xs:h-20"></div>

      {/* Indicador de modo desarrollo */}
      <DevModeIndicator />
    </>
  );
};

export default Navigation;