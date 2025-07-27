import React from 'react';
import { XMarkIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleCart, removeFromCart, updateQuantity } from '../store/slices/cartSlice';
import type { RootState } from '../store';

const ShoppingCart: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isOpen, items, total } = useAppSelector((state: RootState) => state.cart);

  if (!isOpen) return null;

  const handleClose = () => {
    dispatch(toggleCart());
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateQuantity({ productId, quantity }));
    }
  };

  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50 animate-fade-in" onClick={handleClose} />
      
      {/* Panel del carrito */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-light">
            <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
              <span>Tu Carrito</span>
              <span className="text-2xl animate-bounce-gentle">🛒</span>
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-accent rounded-full transition-all duration-200 group hover-scale"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500 group-hover:text-white" />
            </button>
          </div>

          {/* Contenido del carrito */}
          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4 animate-float">🦐</div>
                <p className="text-gray-500 mb-2">Tu carrito está vacío</p>
                <p className="text-sm text-gray-400">
                  Agrega algunos productos frescos del mar
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item: { product: any; quantity: number }, index: number) => (
                  <div key={item.product.id} className="bg-light rounded-lg p-4 hover-lift transition-all duration-300 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="flex items-start space-x-3">
                      <img
                        src={item.product.imageUrl || `https://via.placeholder.com/64x64/4d82bc/FFFFFF?text=${item.product.name.charAt(0)}`}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-md hover-scale transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/64x64/4d82bc/FFFFFF?text=🐟';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate hover:text-primary transition-colors duration-300">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ${item.product.price} / {item.product.unit || 'kg'}
                        </p>
                        <p className="text-xs text-secondary font-medium">
                          {item.product.categoryName || 'Pescado'} • Fresco
                        </p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 hover:bg-accent rounded transition-all duration-200 group hover-scale"
                            >
                              <MinusIcon className="h-4 w-4 text-primary group-hover:text-white" />
                            </button>
                            <span className="px-3 py-1 bg-white rounded-lg text-sm font-medium border border-gray-200 min-w-[2.5rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 hover:bg-accent rounded transition-all duration-200 group hover-scale"
                            >
                              <PlusIcon className="h-4 w-4 text-primary group-hover:text-white" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => handleRemoveItem(item.product.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors duration-200 hover:scale-105"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-right">
                      <span className="text-lg font-semibold text-primary">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-200 p-4 space-y-4 bg-background">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-primary animate-pulse">${total}</span>
              </div>
              
              <button className="w-full bg-button hover:bg-primary text-white py-3 text-lg font-semibold rounded-lg transition-all duration-300 hover-lift btn-gradient-primary group">
                <span className="group-hover:scale-105 transition-transform duration-300 inline-block">
                  Proceder al Pago 💳
                </span>
              </button>
              
              <button
                onClick={handleClose}
                className="w-full bg-light hover:bg-accent text-primary font-medium py-2 px-4 rounded-lg transition-all duration-300 hover-lift group"
              >
                <span className="group-hover:scale-105 transition-transform duration-300 inline-block">
                  Continuar Comprando 🛍️
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
