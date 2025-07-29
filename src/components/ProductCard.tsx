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
  const [isHovered, setIsHovered] = useState(false);

  const handleQuantityChange = (change: number, event: React.MouseEvent) => {
    event.stopPropagation();
    const newQuantity = Math.max(1, quantity + change);
    setQuantity(newQuantity);
  };

  const handleAddToCart = (event: React.MouseEvent) => {
    event.stopPropagation();
    onAddToCart(product, quantity);
    setQuantity(1); // Reset quantity after adding
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
    <div
      className="product-card group cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary/20 w-full max-w-full min-w-0"
      onClick={() => onClick(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{maxWidth: '100vw'}}
    >
      {/* Image Container Optimizado */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden min-w-0">
        {/* Product Images con componente optimizado */}
        {product.images && product.images.length > 0 ? (
          <div className="w-full h-full min-w-0">
            <ProductImageViewer
              images={product.images}
              productName={product.name}
              className="w-full h-full min-w-0"
              showDots={product.images.length > 1}
              showCounter={product.images.length > 1}
              showThumbnails={false}
            />
          </div>
        ) : (
          <div className="relative w-full h-full min-w-0">
            <OptimizedImage
              src={product.imageUrl || ''}
              alt={product.name}
              className="w-full h-full"
              fallbackEmoji="🐟"
              priority={false}
            />
          </div>
        )}

        {/* Freshness Badge */}
        <div className="absolute top-3 left-3 z-20">
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${
            product.freshness === 'Ultra Fresh' 
              ? 'bg-green-500 text-white'
              : product.freshness === 'Fresh'
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-500 text-white'
          }`}>
            {product.freshness}
          </span>
        </div>

        {/* Stock Badge */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-30">
            <span className="bg-red-500 text-white px-4 py-3 rounded-lg font-semibold text-base">
              Agotado
            </span>
          </div>
        )}

        {/* Quick Add Button (appears on hover) */}
        {product.inStock && (
          <div className={`absolute bottom-3 right-3 z-20 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            <button
              onClick={handleAddToCart}
              className="bg-primary text-white p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Product Info Optimizado */}
      <div className="p-3 sm:p-4 lg:p-5 space-y-3 lg:space-y-4 min-w-0">
        {/* Product Name */}
        <h3 className="font-bold text-gray-900 text-base sm:text-lg lg:text-xl line-clamp-2 group-hover:text-primary transition-colors duration-200 leading-tight break-words min-w-0">
          {product.name}
        </h3>

        {/* Price and Unit - Responsive Layout */}
        <div className="flex items-start justify-between gap-2 min-w-0">
          <div className="flex flex-col space-y-1 min-w-0">
            <span className="product-price text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 min-w-0">
              {formatPrice(product.price)}
            </span>
            <span className="unit-label text-xs sm:text-sm text-gray-600 font-medium min-w-0">
              {getUnitLabel(product.unit)}
            </span>
          </div>
          
          {/* Weight/Size Info - Better positioning */}
          {product.weight && (
            <div className="text-right flex-shrink-0 min-w-0">
              <div className="bg-gray-100 px-2 py-1 rounded-full min-w-0">
                <span className="text-xs sm:text-sm text-gray-700 font-medium min-w-0">
                  {product.weight} {product.unit}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
          {product.description}
        </p>

        {/* Origin */}
        <div className="flex items-center text-sm text-gray-500">
          <span className="mr-2 text-base">📍</span>
          <span className="font-medium">{product.origin}</span>
        </div>

        {/* Quantity and Add to Cart */}
        {product.inStock && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 pt-3 border-t border-gray-100">
            {/* Quantity Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Cantidad:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={(e) => handleQuantityChange(-1, e)}
                  disabled={quantity <= 1}
                  className="p-2.5 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="px-3 py-2.5 min-w-[45px] text-center text-sm font-medium">
                  {quantity}
                </span>
                <button
                  onClick={(e) => handleQuantityChange(1, e)}
                  className="p-2.5 hover:bg-gray-100 rounded-r-lg"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="btn-add-to-cart bg-button hover:bg-primary text-white px-5 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2 w-full sm:w-auto text-sm"
            >
              <span className="text-base">🛒</span>
              <span>Agregar</span>
            </button>
          </div>
        )}

        {/* Out of Stock Message */}
        {!product.inStock && (
          <div className="pt-3 border-t border-gray-100">
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-medium cursor-not-allowed text-sm"
            >
              Producto Agotado
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
