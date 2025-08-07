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
      className="group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary/30 h-full flex flex-col"
      onClick={() => onClick(product)}
    >
      {/* Image Container */}
      <div className="relative w-full h-48 sm:h-56 md:h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex-shrink-0">
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
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            priority={true}
            size="medium"
          />
        )}

        {/* Freshness Badge */}
        {product.freshness && (
          <div className="absolute top-2 left-2 z-20">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold shadow-md ${
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

        {/* Stock Badge */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
            <span className="bg-red-500 text-white px-3 py-2 rounded-lg font-semibold text-sm">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        {/* Top Section - Name and Description */}
        <div className="flex-grow mb-4">
          <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-200 mb-2">
            {product.name}
          </h3>

          {product.description && (
            <p className="text-gray-600 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-3">
              {product.description}
            </p>
          )}

          {/* Price Section */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.weight && (
                <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                  {product.weight} {product.unit}
                </span>
              )}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              {getUnitLabel(product.unit)}
            </div>
          </div>

          {/* Origin */}
          {product.origin && (
            <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-3">
              <span className="mr-1">📍</span>
              <span>{product.origin}</span>
            </div>
          )}
        </div>

        {/* Bottom Section - Controls */}
        <div className="mt-auto">
          {product.inStock ? (
            <div className="space-y-3">
              {/* Quantity Selector */}
              <div className="flex items-center justify-center">
                <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                  <button
                    onClick={(e) => handleQuantityChange(-1, e)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors flex items-center justify-center"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-sm font-medium min-w-[50px] text-center bg-gray-50">
                    {quantity}
                  </span>
                  <button
                    onClick={(e) => handleQuantityChange(1, e)}
                    className="p-2 hover:bg-gray-50 rounded-r-lg transition-colors flex items-center justify-center"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:shadow-md active:scale-[0.98] flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <span>🛒</span>
                <span className="hidden xs:inline">Agregar al Carrito</span>
                <span className="xs:hidden">Agregar</span>
              </button>
            </div>
          ) : (
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-medium cursor-not-allowed"
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
