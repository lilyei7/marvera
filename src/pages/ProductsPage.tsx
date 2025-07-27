import React, { useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setSelectedCategory, 
  setSearchQuery, 
  fetchProducts 
} from '../store/slices/productsSlice';
import { addToCart } from '../store/slices/cartSlice';
import { addNotification } from '../store/slices/notificationSlice';
import type { Product, ProductCategory } from '../types';

const ProductsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const productsState = useAppSelector((state) => state.products);
  
  const filteredItems = (productsState as any)?.filteredItems || [];
  const loading = (productsState as any)?.loading || false;
  const error = (productsState as any)?.error || null;
  const categories = (productsState as any)?.categories || [];
  const selectedCategory = (productsState as any)?.selectedCategory || 'all';
  const searchQuery = (productsState as any)?.searchQuery || '';

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleCategoryChange = (category: ProductCategory | 'all') => {
    dispatch(setSelectedCategory(category));
  };

  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const handleAddToCart = (product: Product, event?: React.MouseEvent) => {
    if (event) {
      const button = event.currentTarget as HTMLElement;
      button.classList.add('animate-product-add');
      setTimeout(() => {
        button.classList.remove('animate-product-add');
      }, 600);
    }
    
    dispatch(addToCart({ product, quantity: 1 }));
    dispatch(addNotification({
      message: `${product.name} agregado al carrito 🛒`,
      type: 'success',
      duration: 2000
    }));
  };

  const categoryLabels: Record<ProductCategory | 'all', string> = {
    all: 'Todos',
    pescados: 'Pescados',
    camarones: 'Camarones',
    ostras: 'Ostras',
    langostas: 'Langostas',
    cangrejos: 'Cangrejos',
    moluscos: 'Moluscos',
    otros: 'Otros'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary font-medium">Cargando productos frescos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐟</div>
          <p className="text-red-600 font-medium mb-2">Error al cargar productos</p>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-1 sm:mb-2">Catálogo de Mariscos</h1>
          <p className="text-gray-600 text-xs sm:text-sm md:text-base">Productos frescos directamente del océano</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 xl:w-72 flex-shrink-0">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-6 lg:sticky lg:top-4">
              <div className="flex items-center mb-3 sm:mb-4">
                <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary mr-1.5 sm:mr-2" />
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold text-primary">Filtros</h2>
              </div>

              {/* Search */}
              <div className="mb-3 sm:mb-4 lg:mb-6">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Buscar productos..."
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-xs sm:text-sm transition-all duration-200"
                  />
                  <MagnifyingGlassIcon className="absolute left-2 sm:left-3 top-1.5 sm:top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                  Categorías
                </label>
                <div className="space-y-1.5 sm:space-y-2">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg transition-colors text-xs sm:text-sm ${
                      selectedCategory === 'all'
                        ? 'bg-button text-white'
                        : 'text-gray-700 hover:bg-light'
                    }`}
                  >
                    {categoryLabels.all}
                  </button>
                  {categories.map((category: ProductCategory) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg transition-colors text-xs sm:text-sm ${
                        selectedCategory === category
                          ? 'bg-button text-white'
                          : 'text-gray-700 hover:bg-light'
                      }`}
                    >
                      {categoryLabels[category]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-4">🦐</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-500 text-sm sm:text-base">
                  Intenta cambiar los filtros o la búsqueda
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {filteredItems.map((product: any) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 hover-lift group"
                  >
                    <div className="aspect-w-1 aspect-h-1 bg-light relative h-32 xs:h-36 sm:h-40 md:h-44 lg:h-48">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/300x200/40E0D0/FFFFFF?text=🐟';
                        }}
                      />
                      <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${
                          product.freshness === 'Ultra Fresh' 
                            ? 'bg-green-100 text-green-800'
                            : product.freshness === 'Fresh'
                            ? 'bg-light text-primary'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.freshness}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-2 sm:p-3 md:p-4 lg:p-5">
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1 group-hover:text-primary transition-colors duration-300 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-2 sm:mb-3 text-xs">
                        <span className="text-secondary font-medium flex items-center">
                          <span className="mr-1">📍</span>
                          <span className="truncate">{product.origin}</span>
                        </span>
                        <span className="text-gray-500 whitespace-nowrap ml-2">
                          {product.weight} {product.unit}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between flex-wrap gap-1 sm:gap-2">
                        <div className="flex items-baseline">
                          <span className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-primary">
                            ${product.price}
                          </span>
                          <span className="text-xs text-gray-500 ml-1">
                            / {product.unit}
                          </span>
                        </div>
                        
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={!product.inStock}
                          className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg font-medium transition-all duration-300 btn-add-to-cart text-xs sm:text-sm ${
                            product.inStock
                              ? 'bg-button hover:bg-primary text-white hover:scale-105 hover-lift'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <span className="hidden xs:inline">🛒 </span>
                          {product.inStock ? 'Agregar' : 'Agotado'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
