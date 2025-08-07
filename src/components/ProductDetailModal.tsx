import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ProductImageViewer from './ProductImageViewer';
import { useIsTabletOrLarger } from '../hooks/useWindowSize';

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
  const isTabletOrLarger = useIsTabletOrLarger();
  
  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-2 xs:p-3 sm:p-4" style={{ WebkitTapHighlightColor: 'transparent' }}>
      {/* Overlay - clickeable para cerrar */}
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-6xl bg-white rounded-lg xs:rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden transform transition-all z-10 max-h-[96vh] xs:max-h-[94vh] sm:max-h-[90vh] touch-manipulation">
        {/* Header */}
        <div className="flex items-center justify-between p-4 xs:p-5 sm:p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 truncate pr-2">{product.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-3 xs:p-2.5 sm:p-2 hover:bg-gray-100 rounded-full flex-shrink-0 touch-manipulation active:bg-gray-200"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <XMarkIcon className="w-8 h-8 xs:w-7 xs:h-7 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 xs:p-5 sm:p-6 max-h-[calc(96vh-80px)] xs:max-h-[calc(94vh-90px)] sm:max-h-[calc(90vh-100px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 xs:gap-6 sm:gap-6 lg:gap-8">
            {/* Images - MÁS GRANDES para mejor experiencia */}
            <div className="order-1">
              {product.images && product.images.length > 0 ? (
                <ProductImageViewer
                  images={product.images}
                  productName={product.name}
                  className="w-full h-72 xs:h-80 sm:h-96 lg:h-96 xl:h-[28rem]"
                  showDots={true}
                  showCounter={true}
                  showThumbnails={isTabletOrLarger} // Solo mostrar thumbnails en tablets y desktop
                />
              ) : (
                <div className="w-full h-72 xs:h-80 sm:h-96 lg:h-96 xl:h-[28rem] bg-gradient-to-br from-light-peach to-light-beige flex items-center justify-center rounded-lg overflow-hidden">
                  <img
                    src={product.imageUrl || `https://via.placeholder.com/400x400/4d82bc/FFFFFF?text=${product.name.charAt(0)}`}
                    alt={product.name}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x400/4d82bc/FFFFFF?text=🐟';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4 xs:space-y-5 sm:space-y-6 order-2">
              {/* Price */}
              <div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-2xl xs:text-3xl sm:text-4xl font-bold text-primary">
                    ${product.price}
                  </span>
                  <span className="text-gray-500 text-sm xs:text-base sm:text-lg">
                    / {product.unit}
                  </span>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-base xs:text-lg sm:text-xl font-semibold text-gray-900 mb-3">Descripción</h3>
                  <p className="text-sm xs:text-base sm:text-lg text-gray-600 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Details */}
              <div className="space-y-3 xs:space-y-4">
                <h3 className="text-base xs:text-lg sm:text-xl font-semibold text-gray-900">Detalles del Producto</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4 sm:gap-5 text-sm xs:text-base">
                  <div className="space-y-2">
                    <span className="font-medium text-gray-700">Categoría:</span>
                    <p className="text-gray-600">{product.categoryName || 'Mariscos'}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="font-medium text-gray-700">Origen:</span>
                    <p className="text-gray-600">{product.origin || 'MarVera'}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="font-medium text-gray-700">Frescura:</span>
                    <p className="text-gray-600">{product.freshness || 'Fresh'}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="font-medium text-gray-700">Stock:</span>
                    <p className={`font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {product.inStock ? 'Disponible' : 'Agotado'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="pt-3 xs:pt-4 sm:pt-5">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`w-full py-4 xs:py-4.5 sm:py-5 px-5 xs:px-6 sm:px-7 rounded-lg font-semibold text-base xs:text-lg sm:text-xl transition-all duration-300 touch-manipulation ${
                    product.inStock
                      ? 'bg-button hover:bg-primary text-white hover:scale-105 hover-lift active:scale-[0.96] active:bg-primary/80'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
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
