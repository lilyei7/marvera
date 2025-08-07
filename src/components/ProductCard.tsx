import React, { useState } from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import ProductImageViewer from './ProductImageViewer';
import OptimizedImage from './common/OptimizedImage';

interface ProductCardProps {
  product: any;
  onAddToCart: (product: any, quantity: number) => void;
  onClick: (product: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onClick }) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (change: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleAddToCart = (event: React.MouseEvent) => {
    event.stopPropagation();
    onAddToCart(product, quantity);
    setQuantity(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getUnitLabel = (unit: string) => {
    const unitLabels: Record<string, string> = {
      'kg': 'por kilo',
      'lb': 'por libra',
      'piece': 'por pieza',
      'dozen': 'por docena',
      'docena': 'por docena',
      'pound': 'por libra',
      'g': 'por gramo',
      'unidad': 'por unidad',
      'bandeja': 'por bandeja',
      'paquete': 'por paquete'
    };
    return unitLabels[unit] || `por ${unit}`;
  };

  return (
    <article 
      className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary/30 h-full flex flex-col touch-manipulation select-none"
      onClick={() => onClick(product)}
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* Image Container - Altura responsiva mejorada con aspectRatio fijo - MÁS GRANDE MÓVIL */}
      <div className="relative w-full h-56 xs:h-64 sm:h-72 md:h-80 lg:h-88 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex-shrink-0">
        {product.images && product.images.length > 0 ? (
          <ProductImageViewer
            images={product.images}
            productName={product.name}
            className="w-full h-full"
            showDots={false}
            showCounter={false}
            showThumbnails={false}
          />
        ) : (
          <OptimizedImage
            src={product.imageUrl || ''}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 p-2"
            priority={true}
            size="medium"
          />
        )}

        {/* Freshness Badge - MÁS GRANDE MÓVIL */}
        {product.freshness && (
          <div className="absolute top-2 left-2 z-20">
            <span className={`px-3 py-2 xs:px-2 xs:py-1 rounded-full text-sm xs:text-xs font-semibold shadow-md ${
              product.freshness === 'Ultra Fresh' 
                ? 'bg-green-500 text-white'
                : product.freshness === 'Fresh'
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-500 text-white'
            }`}>
              {product.freshness}
            </span>
          </div>
        )}

        {/* Stock Badge - MÁS GRANDE MÓVIL */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
            <span className="bg-red-500 text-white px-4 py-3 xs:px-3 xs:py-2 rounded-lg font-semibold text-base xs:text-sm">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Product Info - Padding responsivo mejorado + FUENTES MÁS GRANDES MÓVIL */}
      <div className="p-4 xs:p-3 sm:p-4 md:p-5 flex flex-col flex-grow">
        {/* Top Section - Name and Description */}
        <div className="flex-grow mb-4 xs:mb-3 sm:mb-4">
          <h3 className="font-bold text-gray-900 text-lg xs:text-sm sm:text-base md:text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200 mb-3 xs:mb-2">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-gray-600 text-sm xs:text-xs sm:text-sm leading-relaxed line-clamp-2 mb-3 xs:mb-2 sm:mb-3">
              {product.description}
            </p>
          )}

          {/* Price Section - FUENTES MÁS GRANDES MÓVIL */}
          <div className="mb-3 xs:mb-2 sm:mb-3">
            <div className="flex items-center justify-between mb-2 xs:mb-1">
              <span className="text-xl xs:text-base sm:text-lg md:text-xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.weight && (
                <span className="bg-gray-100 px-3 py-2 xs:px-2 xs:py-1 rounded-full text-sm xs:text-xs font-medium text-gray-700">
                  {product.weight} {product.unit}
                </span>
              )}
            </div>
            <div className="text-sm xs:text-xs sm:text-sm text-gray-600">
              {getUnitLabel(product.unit)}
            </div>
          </div>

          {/* Origin - MÁS GRANDE MÓVIL */}
          {product.origin && (
            <div className="flex items-center text-sm xs:text-xs sm:text-sm text-gray-500">
              <span className="mr-1">📍</span>
              <span>{product.origin}</span>
            </div>
          )}
        </div>

        {/* Bottom Section - Controls con layout mejorado + BOTONES MÁS GRANDES MÓVIL */}
        <div className="mt-auto space-y-3 xs:space-y-2 sm:space-y-3">
          {product.inStock ? (
            <>
              {/* Quantity Selector - Centrado y compacto con mejor táctil + MÁS GRANDE MÓVIL */}
              <div className="flex items-center justify-center">
                <div className="flex items-center border border-gray-300 rounded-lg bg-white shadow-sm">
                  <button
                    onClick={(e) => handleQuantityChange(-1, e)}
                    disabled={quantity <= 1}
                    className="w-12 h-12 xs:w-10 xs:h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors touch-manipulation active:bg-gray-100"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <MinusIcon className="h-5 w-5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                  </button>
                  <span className="px-5 xs:px-4 sm:px-5 py-3 xs:py-2 text-base xs:text-sm font-medium min-w-[60px] xs:min-w-[50px] sm:min-w-[60px] text-center bg-gray-50">
                    {quantity}
                  </span>
                  <button
                    onClick={(e) => handleQuantityChange(1, e)}
                    className="w-12 h-12 xs:w-10 xs:h-10 sm:w-11 sm:h-11 flex items-center justify-center hover:bg-gray-50 rounded-r-lg transition-colors touch-manipulation active:bg-gray-100"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <PlusIcon className="h-5 w-5 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button - Responsivo y nunca se desborda con mejor táctil + MÁS GRANDE MÓVIL */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 xs:py-3 sm:py-3.5 px-4 xs:px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-md active:scale-[0.96] active:bg-primary/80 flex items-center justify-center space-x-2 xs:space-x-1 sm:space-x-2 text-base xs:text-xs sm:text-sm md:text-base touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <span className="text-base xs:text-sm">🛒</span>
                <span className="hidden xs:inline">Agregar al Carrito</span>
                <span className="xs:hidden">Agregar al Carrito</span>
              </button>
            </>
          ) : (
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 py-4 xs:py-3 sm:py-3.5 rounded-lg font-medium cursor-not-allowed text-base xs:text-xs sm:text-sm touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              Agotado
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
