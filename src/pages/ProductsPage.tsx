import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
  const [searchParams] = useSearchParams();
  const { 
    filteredItems, 
    loading, 
    error, 
    categories, 
    selectedCategory, 
    searchQuery 
  } = useAppSelector((state) => state.products);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  // EMERGENCY BYPASS: Direct fetch to avoid Redux corruption
  const [directProducts, setDirectProducts] = useState<any[]>([]);
  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState<string | null>(null);
  
  // Direct fetch function
  const fetchProductsDirectly = async () => {
    try {
      setDirectLoading(true);
      setDirectError(null);
      console.log('🚨 EMERGENCY BYPASS: Fetching products directly');
      
      const response = await fetch('https://marvera.mx/api/products');
      const data = await response.json();
      
      console.log('📦 DIRECT API RESPONSE:', data);
      
      if (data.success && Array.isArray(data.data)) {
        const processedProducts = data.data.map((product: any, index: number) => ({
          id: product.id?.toString() || `direct-${index}`,
          name: product.name || 'Producto sin nombre',
          description: product.description || '',
          price: product.price || 0,
          category: product.category || 'otros',
          imageUrl: product.imageUrl || product.image || '',
          inStock: (product.stock || 0) > 0,
          origin: product.origin || 'MarVera',
          freshness: product.freshness || 'Fresh',
          weight: product.weight || 1,
          unit: product.unit || 'kg',
          isFeatured: product.isFeatured === true || product.isFeatured === 1,
          images: product.images || [],
          stock: product.stock || 0,
          categoryName: product.category || product.categoryName || 'Otros'
        }));
        
        console.log('✅ DIRECT PRODUCTS PROCESSED:', processedProducts.length);
        setDirectProducts(processedProducts);
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (error) {
      console.error('❌ DIRECT FETCH ERROR:', error);
      setDirectError('Error al cargar productos directamente');
    } finally {
      setDirectLoading(false);
    }
  };
  
  // Try direct fetch if Redux seems to be failing
  useEffect(() => {
    if (!loading && (!Array.isArray(filteredItems) || filteredItems.length === 0)) {
      console.log('🔄 REDUX APPEARS TO BE FAILING: Trying direct fetch');
      fetchProductsDirectly();
    }
  }, [loading, filteredItems]);
  
  // Choose data source: Redux if working, direct if not
  const finalProducts = useMemo(() => {
    if (Array.isArray(filteredItems) && filteredItems.length > 0) {
      console.log('✅ USING REDUX DATA:', filteredItems.length, 'products');
      return filteredItems;
    } else if (Array.isArray(directProducts) && directProducts.length > 0) {
      console.log('✅ USING DIRECT FETCH DATA:', directProducts.length, 'products');
      return directProducts;
    } else {
      console.log('⚠️ NO PRODUCTS AVAILABLE FROM ANY SOURCE');
      return [];
    }
  }, [filteredItems, directProducts]);
  
  const finalLoading = loading || directLoading;
  const finalError = error || directError;
  
  // ULTRA DEFENSIVE: Multiple layers of array validation
  console.log('🔍 ProductsPage - filteredItems del store:', filteredItems);
  console.log('🔍 ProductsPage - Es array?', Array.isArray(filteredItems));
  console.log('🔍 ProductsPage - Type:', typeof filteredItems);
  console.log('🔍 ProductsPage - Loading state:', loading);
  
  // STEP 1: Basic null/undefined check
  const rawFilteredItems: any = filteredItems || [];
  console.log('🔍 Step 1 - rawFilteredItems:', rawFilteredItems);
  
  // STEP 2: Array validation with reconstruction if needed
  let validatedFilteredItems: any[] = [];
  if (Array.isArray(rawFilteredItems)) {
    validatedFilteredItems = rawFilteredItems;
  } else if (rawFilteredItems && typeof rawFilteredItems === 'object') {
    // Try to extract array from object if wrapped
    if (rawFilteredItems.data && Array.isArray(rawFilteredItems.data)) {
      validatedFilteredItems = rawFilteredItems.data;
    } else if (rawFilteredItems.items && Array.isArray(rawFilteredItems.items)) {
      validatedFilteredItems = rawFilteredItems.items;
    } else {
      // Convert to array if it's an object with numeric keys
      const keys = Object.keys(rawFilteredItems);
      if (keys.length > 0 && keys.every(k => !isNaN(Number(k)))) {
        validatedFilteredItems = Object.values(rawFilteredItems);
      } else {
        validatedFilteredItems = [];
      }
    }
  } else {
    validatedFilteredItems = [];
  }
  
  // STEP 3: Final safety wrapper with forced array creation
  const safeFilteredItems = Array.isArray(validatedFilteredItems) ? [...validatedFilteredItems] : [];
  
  console.log('🔍 Step 2 - validatedFilteredItems:', validatedFilteredItems);
  console.log('🔍 Step 3 - safeFilteredItems:', safeFilteredItems);
  console.log('🔍 Final - safeFilteredItems length:', safeFilteredItems.length);
  console.log('🔍 Final - safeFilteredItems is Array?', Array.isArray(safeFilteredItems));
  
  // Same process for categories with explicit typing
  const rawCategories: any = categories || [];
  const validatedCategories = Array.isArray(rawCategories) ? rawCategories : [];
  const safeCategories = Array.isArray(validatedCategories) ? [...validatedCategories] : [];
  
  console.log('🔍 Categories - safeCategories length:', safeCategories.length);
  console.log('🔍 Categories - safeCategories is Array?', Array.isArray(safeCategories));
  
  // Additional safety: Ensure both are arrays before render
  if (!Array.isArray(safeFilteredItems)) {
    console.error('❌ safeFilteredItems no es array:', safeFilteredItems);
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐟</div>
          <p className="text-red-600 font-medium mb-2">Error en datos de productos</p>
          <p className="text-gray-500">Los datos no tienen el formato correcto</p>
        </div>
      </div>
    );
  }
  
  if (!Array.isArray(safeCategories)) {
    console.error('❌ safeCategories no es array:', safeCategories);
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐟</div>
          <p className="text-red-600 font-medium mb-2">Error en datos de categorías</p>
          <p className="text-gray-500">Los datos no tienen el formato correcto</p>
        </div>
      </div>
    );
  }
  
  // Early return if we're still loading
  if (finalLoading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary font-medium">Cargando productos frescos...</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Efecto para capturar parámetros de búsqueda de la URL
  useEffect(() => {
    const searchFromUrl = searchParams.get('search');
    if (searchFromUrl) {
      console.log('🔍 Búsqueda desde URL:', searchFromUrl);
      dispatch(setSearchQuery(searchFromUrl));
    }
  }, [searchParams, dispatch]);

  const handleCategoryChange = (category: ProductCategory | 'all') => {
    dispatch(setSelectedCategory(category));
    setIsMobileFiltersOpen(false); // Cerrar el menú móvil después de seleccionar
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

  if (finalLoading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary font-medium">Cargando productos frescos...</p>
        </div>
      </div>
    );
  }

  if (finalError) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐟</div>
          <p className="text-red-600 font-medium mb-2">Error al cargar productos</p>
          <p className="text-gray-500">{finalError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-3">Catálogo de Mariscos</h1>
          <p className="text-gray-600 text-lg sm:text-xl">Productos frescos directamente del océano</p>
        </div>
      </div>

      {/* Search Results Indicator */}
      {searchQuery && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <p className="text-blue-800 text-sm">
                🔍 Mostrando resultados para: <span className="font-semibold">"{searchQuery}"</span>
                {finalProducts.length > 0 && (
                  <span className="ml-2 text-blue-600">({finalProducts.length} productos encontrados)</span>
                )}
              </p>
              <button
                onClick={() => dispatch(setSearchQuery(''))}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
              >
                <XMarkIcon className="h-4 w-4" />
                Limpiar búsqueda
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar Mobile */}
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                />
                <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap"
            >
              <FunnelIcon className="h-5 w-5" />
              <span className="font-medium">Filtros</span>
              {selectedCategory !== 'all' && (
                <span className="bg-white text-primary text-xs px-2 py-0.5 rounded-full">1</span>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 lg:sticky lg:top-4">
              <div className="flex items-center mb-6">
                <FunnelIcon className="h-6 w-6 text-primary mr-3" />
                <h2 className="text-xl font-semibold text-primary">Filtros</h2>
              </div>

              {/* Search */}
              <div className="mb-8">
                <label className="block text-lg font-medium text-gray-700 mb-3">
                  Buscar
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Buscar productos..."
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-lg transition-all duration-200"
                  />
                  <MagnifyingGlassIcon className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-4">
                  Categorías
                </label>
                <div className="space-y-3">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-lg ${
                      selectedCategory === 'all'
                        ? 'bg-button text-white'
                        : 'text-gray-700 hover:bg-light'
                    }`}
                  >
                    {categoryLabels.all}
                  </button>
                  {safeCategories.map((category: ProductCategory) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-lg ${
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
            {finalProducts.length === 0 ? (
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
              <div className="products-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 px-2 sm:px-0">
                {(() => {
                  console.log('🔄 Iniciando render de productos...');
                  console.log('🔄 safeFilteredItems antes del map:', safeFilteredItems);
                  console.log('🔄 Tipo de safeFilteredItems:', typeof safeFilteredItems);
                  console.log('🔄 Es array?:', Array.isArray(safeFilteredItems));
                  console.log('🔄 Longitud:', safeFilteredItems?.length);
                  
                  if (!Array.isArray(safeFilteredItems)) {
                    console.error('❌ NO ES ARRAY en render!');
                    return (
                      <div className="col-span-full text-center py-12">
                        <div className="text-6xl mb-4">⚠️</div>
                        <p className="text-red-500 text-lg mb-2">Error: Datos no son array</p>
                      </div>
                    );
                  }
                  
                  if (safeFilteredItems.length === 0) {
                    return (
                      <div className="col-span-full text-center py-12">
                        <div className="text-6xl mb-4">🐟</div>
                        <p className="text-gray-500 text-lg mb-2">No se encontraron productos</p>
                        <p className="text-gray-400">Intenta cambiar los filtros o buscar algo diferente</p>
                      </div>
                    );
                  }
                  
                  try {
                    // FINAL VALIDATION: Ensure we have a proper array with map function
                    if (!finalProducts || typeof finalProducts.map !== 'function') {
                      console.error('❌ finalProducts no tiene función map:', finalProducts);
                      throw new Error('Array corruption detected - no map function available');
                    }
                    
                    console.log('✅ Pre-map validation passed. Array length:', finalProducts.length);
                    console.log('✅ Array.isArray check:', Array.isArray(finalProducts));
                    console.log('✅ Has map function:', typeof finalProducts.map === 'function');
                    
                    return finalProducts.map((product: any, index: number) => {
                      console.log(`🔄 Renderizando producto ${index}:`, product);
                      
                      // Extra safety check for each product
                      if (!product || typeof product !== 'object') {
                        console.warn(`⚠️ Producto inválido en índice ${index}:`, product);
                        return null;
                      }
                      
                      return (
                        <ProductCard
                          key={product.id || `product-${index}`}
                          product={product}
                          onAddToCart={handleAddToCart}
                          onClick={handleProductClick}
                        />
                      );
                    });
                  } catch (error) {
                    console.error('❌ Error en map de productos:', error);
                    return (
                      <div className="col-span-full text-center py-12">
                        <div className="text-6xl mb-4">�</div>
                        <p className="text-red-500 text-lg mb-2">Error al renderizar productos</p>
                        <p className="text-gray-400">Error: {String(error)}</p>
                      </div>
                    );
                  }
                })()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileFiltersOpen(false)}
          ></div>
          
          {/* Modal */}
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold text-primary flex items-center">
                <FunnelIcon className="h-6 w-6 mr-2" />
                Filtros
              </h2>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="p-4">
              {/* Categories */}
              <div className="mb-6">
                <label className="block text-lg font-medium text-gray-700 mb-4">
                  Categorías
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`text-center px-4 py-3 rounded-lg transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {categoryLabels.all}
                  </button>
                  {safeCategories.map((category: ProductCategory) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`text-center px-4 py-3 rounded-lg transition-colors ${
                        selectedCategory === category
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {categoryLabels[category]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters Button */}
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => handleCategoryChange('all')}
                  className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        </div>
      )}

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
