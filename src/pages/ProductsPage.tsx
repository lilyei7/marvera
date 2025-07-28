import React, { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  setSelectedCategory, 
  setSearchQuery, 
  fetchProducts 
} from '../store/slices/productsSlice';
import { addToCart } from '../store/slices/cartSlice';
import { addNotification } from '../store/slices/notificationSlice';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import type { Product, ProductCategory } from '../types';

const ProductsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const productsState = useAppSelector((state) => state.products);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  const handleAddToCart = (product: Product, quantity: number = 1, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation(); // Evitar que se abra el modal
      const button = event.currentTarget as HTMLElement;
      button.classList.add('animate-product-add');
      setTimeout(() => {
        button.classList.remove('animate-product-add');
      }, 600);
    }
    
    dispatch(addToCart({ product, quantity }));
    dispatch(addNotification({
      message: `${quantity}x ${product.name} agregado al carrito 🛒`,
      type: 'success',
      duration: 2000
    }));
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleModalAddToCart = (product: any) => {
    handleAddToCart(product);
    handleCloseModal();
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
              <div className="products-grid grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                {filteredItems.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onClick={handleProductClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onAddToCart={handleModalAddToCart}
      />
    </div>
  );
};

export default ProductsPage;
