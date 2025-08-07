import React, { useState, useEffect } from 'react';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

const CartIndicator: React.FC = () => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Función para actualizar el contador del carrito
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('marvera_cart') || '[]');
      const totalItems = cart.reduce((total: number, item: any) => total + item.quantity, 0);
      setCartCount(totalItems);
    };

    // Actualizar inicialmente
    updateCartCount();

    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      updateCartCount();
    };

    // Agregar event listener para cambios en localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Escuchar evento personalizado para cambios en el carrito
    window.addEventListener('cartUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, []);

  if (cartCount === 0) return null;

  return (
    <div className="fixed top-20 right-4 bg-blue-600 text-white rounded-full p-3 shadow-lg z-50 flex items-center space-x-2">
      <ShoppingCartIcon className="h-5 w-5" />
      <span className="font-medium">{cartCount}</span>
      <span className="text-xs opacity-90">
        {cartCount === 1 ? 'producto' : 'productos'}
      </span>
    </div>
  );
};

export default CartIndicator;
