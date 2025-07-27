import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, ShoppingBagIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleCart } from '../store/slices/cartSlice';
import { verifyToken, logoutUser } from '../store/slices/authSlice';
import AuthModal from './AuthModal';

const Navigation: React.FC = () => {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => (state.cart as any)?.items || []);
  const itemCount = cartItems.reduce((total: number, item: any) => total + item.quantity, 0);
  const { user, isAuthenticated, isLoading } = useAppSelector(state => state.auth);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    // Verificar token al cargar la app
    dispatch(verifyToken());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    setShowUserMenu(false);
  };

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-marina-600">
                🌊 MarVera
              </div>
            </Link>

            {/* Barra de búsqueda */}
            <div className="flex-1 max-w-lg mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar mariscos frescos..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-marina-500 focus:border-marina-500"
                />
              </div>
            </div>

            {/* Menú derecha */}
            <div className="flex items-center space-x-4">
              {/* Usuario / Login */}
              <div className="relative">
                {isAuthenticated && user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center space-x-2 text-gray-700 hover:text-marina-600 px-3 py-2 rounded-lg hover:bg-gray-100"
                    >
                      <UserIcon className="h-6 w-6" />
                      <span className="hidden md:block">
                        {user.firstName} {user.lastName}
                      </span>
                    </button>

                    {/* Dropdown del usuario */}
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Mi Perfil
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Mis Pedidos
                        </Link>
                        {user.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setShowUserMenu(false)}
                          >
                            Panel Admin
                          </Link>
                        )}
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Cerrar Sesión
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center space-x-1 text-gray-700 hover:text-marina-600 px-3 py-2 rounded-lg hover:bg-gray-100"
                    disabled={isLoading}
                  >
                    <UserIcon className="h-6 w-6" />
                    <span className="hidden md:block">
                      {isLoading ? 'Verificando...' : 'Iniciar Sesión'}
                    </span>
                  </button>
                )}
              </div>

              {/* Carrito */}
              <button
                onClick={() => dispatch(toggleCart())}
                className="relative flex items-center space-x-1 text-gray-700 hover:text-marina-600 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <ShoppingBagIcon className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-marina-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
                <span className="hidden md:block">Carrito</span>
              </button>
            </div>
          </div>
        </div>

        {/* Menú de categorías */}
        <div className="bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 py-3">
              <Link
                to="/products"
                className="text-sm text-gray-600 hover:text-marina-600 font-medium"
              >
                Todos los Productos
              </Link>
              <Link
                to="/products?category=pescados-frescos"
                className="text-sm text-gray-600 hover:text-marina-600 font-medium"
              >
                Pescados Frescos
              </Link>
              <Link
                to="/products?category=mariscos"
                className="text-sm text-gray-600 hover:text-marina-600 font-medium"
              >
                Mariscos
              </Link>
              <Link
                to="/products?category=crustaceos"
                className="text-sm text-gray-600 hover:text-marina-600 font-medium"
              >
                Crustáceos
              </Link>
              <Link
                to="/products?category=moluscos"
                className="text-sm text-gray-600 hover:text-marina-600 font-medium"
              >
                Moluscos
              </Link>
              <Link
                to="/products?category=premium"
                className="text-sm text-gray-600 hover:text-marina-600 font-medium"
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
