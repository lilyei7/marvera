import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { useResponsive } from '../../hooks/useResponsive';
import OptimizedImage from '../common/OptimizedImage';
import type { Product } from '../../types';

interface ResponsiveProductCardProps {
  product: Product;
  priority?: boolean;
  onClick?: () => void;
}

const ResponsiveProductCard: React.FC<ResponsiveProductCardProps> = ({
  product,
  priority = false,
  onClick
}) => {
  const dispatch = useDispatch();
  const [quantity, setQuantity] = useState(1);
  const { isMobile, isTablet } = useResponsive();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.inStock) {
      dispatch(addToCart({
        product: product,
        quantity: quantity
      }));
      setQuantity(1);
    }
  };

  const incrementQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
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

  // Configuración responsiva
  const imageHeight = isMobile ? 'h-44' : isTablet ? 'h-48' : 'h-56';
  const padding = isMobile ? 'p-3' : 'p-4';
  const titleSize = isMobile ? 'text-sm' : 'text-base';
  const priceSize = isMobile ? 'text-lg' : 'text-xl';

  return (
    <article
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary/30 cursor-pointer group h-full flex flex-col"
      onClick={onClick}
    >
      {/* Imagen del producto */}
      <div className={`relative ${imageHeight} overflow-hidden flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100`}>
        <OptimizedImage
          src={product.imageUrl || ''}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          priority={priority}
          size="medium"
        />
        
        {/* Badge de frescura */}
        {product.freshness && (
          <div className="absolute top-2 left-2">
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

        {/* Badge de estado */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
            product.inStock 
              ? 'bg-green-100/90 text-green-800 border border-green-200/50' 
              : 'bg-red-100/90 text-red-800 border border-red-200/50'
          }`}>
            {product.inStock ? 'Disponible' : 'Agotado'}
          </span>
        </div>

        {/* Overlay si no está disponible */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-2 rounded-lg font-semibold text-sm">
              Agotado
            </span>
          </div>
        )}
      </div>

      {/* Contenido del card */}
      <div className={`${padding} flex flex-col flex-grow`}>
        {/* Información del producto */}
        <div className="flex-grow mb-4">
          {/* Categoría */}
          <span className="text-xs text-primary font-medium uppercase tracking-wide">
            {product.category}
          </span>

          {/* Nombre del producto */}
          <h3 className={`${titleSize} font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors mt-1 mb-2`}>
            {product.name}
          </h3>

          {/* Descripción - solo en pantallas grandes */}
          {!isMobile && product.description && (
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-3">
              {product.description}
            </p>
          )}

          {/* Precio */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className={`${priceSize} font-bold text-gray-900`}>
                {formatPrice(product.price)}
              </span>
              {product.weight && (
                <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                  {product.weight} {product.unit}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-600">
              {getUnitLabel(product.unit || '')}
            </div>
          </div>

          {/* Origen - solo en pantallas grandes */}
          {!isMobile && product.origin && (
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-1">📍</span>
              <span>{product.origin}</span>
            </div>
          )}
        </div>

        {/* Controles en la parte inferior */}
        <div className="mt-auto">
          {product.inStock ? (
            <div className="space-y-3">
              {/* Selector de cantidad */}
              <div className="flex items-center justify-center">
                <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg transition-colors"
                  >
                    <span className="text-gray-700">-</span>
                  </button>
                  <span className="px-4 py-2 text-sm font-medium min-w-[50px] text-center bg-gray-50">
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    className="p-2 hover:bg-gray-50 rounded-r-lg transition-colors"
                  >
                    <span className="text-gray-700">+</span>
                  </button>
                </div>
              </div>

              {/* Botón de agregar */}
              <button
                onClick={handleAddToCart}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 hover:shadow-md active:scale-[0.98] flex items-center justify-center space-x-2"
              >
                <span>🛒</span>
                <span className={isMobile ? 'text-sm' : 'text-base'}>
                  {isMobile ? 'Agregar' : 'Agregar al Carrito'}
                </span>
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

export default ResponsiveProductCard;
