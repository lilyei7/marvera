import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ProductImageViewer from './ProductImageViewer';

interface ProductDetailModalProps {
  product: any | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: any) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart
}) => {
  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      {/* Overlay - clickeable para cerrar */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{product.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Images */}
            <div className="order-1">
              {product.images && product.images.length > 0 ? (
                <ProductImageViewer
                  images={product.images}
                  productName={product.name}
                  className="w-full h-64 sm:h-80 lg:h-96"
                  showDots={true}
                  showCounter={true}
                  showThumbnails={true}
                />
              ) : (
                <div className="w-full h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-light-peach to-light-beige flex items-center justify-center rounded-lg">
                  <img
                    src={product.imageUrl || `https://via.placeholder.com/400x400/4d82bc/FFFFFF?text=${product.name.charAt(0)}`}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x400/4d82bc/FFFFFF?text=🐟';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4 sm:space-y-6 order-2">
              {/* Price */}
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    ${product.price}
                  </span>
                  <span className="text-gray-500 text-sm sm:text-base">
                    / {product.unit}
                  </span>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Details */}
              <div className="space-y-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Detalles del Producto</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Categoría:</span>
                    <p className="text-gray-600">{product.categoryName || 'Mariscos'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Origen:</span>
                    <p className="text-gray-600">{product.origin || 'MarVera'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Frescura:</span>
                    <p className="text-gray-600">{product.freshness || 'Fresh'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Stock:</span>
                    <p className={`font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {product.inStock ? 'Disponible' : 'Agotado'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-base sm:text-lg transition-all duration-300 ${
                    product.inStock
                      ? 'bg-button hover:bg-primary text-white hover:scale-105 hover-lift'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {product.inStock ? '🛒 Agregar al Carrito' : 'Producto Agotado'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
