import React, { useState } from 'react';
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import ProductImageViewer from './ProductImageViewer';

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
      className="product-card group cursor-pointer bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary/20"
      onClick={() => onClick(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {/* Product Images */}
        {product.images && product.images.length > 0 ? (
          <div className="w-full h-full">
            <ProductImageViewer
              images={product.images}
              productName={product.name}
              className="w-full h-full"
              showDots={product.images.length > 1}
              showCounter={product.images.length > 1}
              showThumbnails={false}
            />
          </div>
        ) : (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/400x400/40E0D0/FFFFFF?text=🐟';
            }}
          />
        )}

        {/* Freshness Badge */}
        <div className="absolute top-3 left-3 z-20">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
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
            <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold">
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
              className="bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <h3 className="font-bold text-gray-900 text-lg line-clamp-1 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {/* Price and Unit */}
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="product-price text-2xl">
              {formatPrice(product.price)}
            </span>
            <span className="unit-label">
              {getUnitLabel(product.unit)}
            </span>
          </div>
          
          {/* Weight/Size Info */}
          {product.weight && (
            <div className="text-right">
              <span className="text-sm text-gray-600 font-medium">
                {product.weight} {product.unit}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Origin */}
        <div className="flex items-center text-sm text-gray-500">
          <span className="mr-1">📍</span>
          <span className="font-medium">{product.origin}</span>
        </div>

        {/* Quantity and Add to Cart */}
        {product.inStock && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            {/* Quantity Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">Cantidad:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={(e) => handleQuantityChange(-1, e)}
                  disabled={quantity <= 1}
                  className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg"
                >
                  <MinusIcon className="h-4 w-4" />
                </button>
                <span className="px-3 py-1 min-w-[40px] text-center text-sm font-medium">
                  {quantity}
                </span>
                <button
                  onClick={(e) => handleQuantityChange(1, e)}
                  className="p-1 hover:bg-gray-100 rounded-r-lg"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="btn-add-to-cart bg-button hover:bg-primary text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center space-x-1"
            >
              <span>🛒</span>
              <span>Agregar</span>
            </button>
          </div>
        )}

        {/* Out of Stock Message */}
        {!product.inStock && (
          <div className="pt-2 border-t border-gray-100">
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 py-2 rounded-lg font-medium cursor-not-allowed"
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
