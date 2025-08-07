import React, { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import { useAppDispatch } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';

// Simple standalone component without Redux
const ProductsPageSimple: React.FC = () => {
  const dispatch = useAppDispatch();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Categories hardcoded to avoid Redux issues
  const categories = [
    { id: 'pescados', name: 'Pescados', slug: 'pescados' },
    { id: 'camarones', name: 'Camarones', slug: 'camarones' },
    { id: 'langostas', name: 'Langostas', slug: 'langostas' },
    { id: 'ostras', name: 'Ostras', slug: 'ostras' },
    { id: 'otros', name: 'Otros', slug: 'otros' }
  ];

  // Simple fetch without Redux
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log('🚀 SIMPLE FETCH: Loading products...');
        setLoading(true);
        setError(null);

        const response = await fetch('https://marvera.mx/api/products');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('📦 SIMPLE RESPONSE:', data);

        if (data.success && Array.isArray(data.data)) {
          const processedProducts = data.data.map((product: any) => {
            // Parse images from JSON string if needed
            let parsedImages: string[] = [];
            try {
              if (typeof product.images === 'string') {
                parsedImages = JSON.parse(product.images);
              } else if (Array.isArray(product.images)) {
                parsedImages = product.images;
              }
              
              // Ensure images have full URLs
              parsedImages = parsedImages.map((url: string) => 
                url.startsWith('http') ? url : `https://marvera.mx${url}`
              );
            } catch (e) {
              console.warn('Error parsing product images:', e, product.images);
              parsedImages = [];
            }

            // Get first image for compatibility
            const firstImage = parsedImages.length > 0 ? parsedImages[0] : '/images/default.webp';

            return {
              id: String(product.id || Math.random()),
              name: product.name || 'Producto sin nombre',
              description: product.description || '',
              price: Number(product.price) || 0,
              category: product.category?.name || product.categoryName || product.category || 'otros',
              imageUrl: firstImage, // First image for compatibility
              inStock: Number(product.stock || 0) > 0,
              origin: product.origin || 'MarVera',
              freshness: product.freshness || 'Fresco',
              weight: Number(product.weight) || 1,
              unit: product.unit || 'kg',
              isFeatured: Boolean(product.isFeatured),
              images: parsedImages, // Full array of images
              stock: Number(product.stock) || 0,
              categoryName: product.category?.name || product.categoryName || product.category || 'Otros'
            };
          });

          console.log('✅ SIMPLE PRODUCTS PROCESSED:', processedProducts.length);
          setProducts(processedProducts);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('❌ SIMPLE FETCH ERROR:', err);
        setError('Error al cargar productos');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Auto-close toast after 3 seconds
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Simple filtering
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Función para abrir modal cuando se hace click en producto
  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleAddToCart = (product: any, quantity: number) => {
    console.log('🛒 Agregando al carrito:', product.name, 'Cantidad:', quantity);
    
    // Usar Redux para agregar al carrito (como el componente original)
    dispatch(addToCart({ 
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        description: product.description,
        inStock: product.inStock,
        origin: product.origin,
        freshness: product.freshness,
        weight: product.weight,
        unit: product.unit
      }, 
      quantity 
    }));
    
    // Mantener también localStorage como respaldo
    const currentCart = JSON.parse(localStorage.getItem('marvera_cart') || '[]');
    const existingProductIndex = currentCart.findIndex((item: any) => item.id === product.id);
    
    if (existingProductIndex >= 0) {
      currentCart[existingProductIndex].quantity += quantity;
    } else {
      currentCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.imageUrl,
        unit: product.unit
      });
    }
    
    localStorage.setItem('marvera_cart', JSON.stringify(currentCart));
    
    // Mostrar toast
    setToastMessage(`${product.name} agregado al carrito (${quantity} ${product.unit || 'unidades'})`);
    setShowToast(true);
  };

  const handleAddToCartFromModal = (product: any) => {
    console.log('🛒 Agregando desde modal:', product.name);
    // Agregar 1 unidad desde el modal
    handleAddToCart(product, 1);
    // Cerrar modal después de agregar
    handleCloseModal();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 right-4 bg-green-600 text-white rounded-lg shadow-lg p-4 z-50 max-w-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-green-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">✅ {toastMessage}</p>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="flex-shrink-0 text-green-200 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Nuestros Productos</h1>
          <p className="mt-2 text-gray-600">Descubre la frescura del mar en cada producto</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar productos..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categorías
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value="all"
                      checked={selectedCategory === 'all'}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Todos</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.slug}
                        checked={selectedCategory === category.slug}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Mobile filter button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => console.log('Mobile filters')}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filtros
              </button>
            </div>

            {/* Results count */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Mostrando {filteredProducts.length} de {products.length} productos
              </p>
            </div>

            {/* Products grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onClick={handleProductClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="w-8 h-8 bg-gray-400 rounded opacity-50"></div>
                </div>
                <h3 className="text-gray-900 mb-2 text-lg font-semibold">
                  No se encontraron productos
                </h3>
                <p className="text-gray-600">
                  Intenta cambiar los filtros o buscar algo diferente
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onAddToCart={handleAddToCartFromModal}
        />
      )}
    </div>
  );
};

export default ProductsPageSimple;
