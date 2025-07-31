import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  XMarkIcon,
  ShoppingCartIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useAppDispatch } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';
import { addNotification } from '../store/slices/notificationSlice';

interface WholesaleProduct {
  id: number;
  name: string;
  description: string;
  pricePerBox: number;
  unitsPerBox: number;
  unitType: string;
  category: string;
  categoryId?: number;
  inStock: boolean;
  stock: number;
  minimumOrder: number;
  imageUrl: string;
  isFeatured: boolean;
}

const WholesalePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [products, setProducts] = useState<WholesaleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  // Cantidades para cada producto (en cajas)
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const categories = ['Pescados', 'Crustáceos', 'Moluscos', 'Otros'];

  useEffect(() => {
    fetchWholesaleProducts();
  }, []);

  const fetchWholesaleProducts = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:3001' : 'https://marvera.mx';
      const response = await fetch(`${API_BASE_URL}/api/wholesale-products`);
      
      if (!response.ok) {
        throw new Error('Error al cargar productos de mayoreo');
      }
      
      const data = await response.json();
      setProducts(data);
      
      // Inicializar cantidades con el mínimo de pedido
      const initialQuantities: Record<number, number> = {};
      data.forEach((product: WholesaleProduct) => {
        initialQuantities[product.id] = product.minimumOrder;
      });
      setQuantities(initialQuantities);
      
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar productos de mayoreo');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (product && newQuantity >= product.minimumOrder) {
      setQuantities(prev => ({
        ...prev,
        [productId]: newQuantity
      }));
    }
  };

  const handleAddToCart = (product: WholesaleProduct) => {
    const quantity = quantities[product.id] || product.minimumOrder;
    const totalUnits = quantity * product.unitsPerBox;
    const unitPrice = product.pricePerBox / product.unitsPerBox;
    
    // Convertir el producto de mayoreo al formato del carrito regular
    const cartProduct = {
      id: `wholesale-${product.id}`,
      name: `${product.name} (Mayoreo - ${quantity} cajas)`,
      price: unitPrice,
      category: product.category as any,
      description: `${product.description} - ${product.unitsPerBox} ${product.unitType} por caja`,
      inStock: product.inStock,
      unit: product.unitType,
      isWholesale: true,
      originalWholesaleProduct: product,
      boxesOrdered: quantity
    };

    dispatch(addToCart({ 
      product: cartProduct, 
      quantity: totalUnits 
    }));

    dispatch(addNotification({
      message: `${quantity} cajas de ${product.name} agregadas al carrito (${totalUnits} ${product.unitType}) 📦`,
      type: 'success',
      duration: 3000
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary font-medium">Cargando productos de mayoreo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📦</div>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-3">
            Ventas al Mayoreo 📦
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl">
            Productos frescos por cajas - Precios especiales para restaurantes y distribuidores
          </p>
        </div>
      </div>

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
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos de mayoreo..."
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
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
              
              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar productos..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Categories */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Categorías</label>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todas las categorías
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters Button */}
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="w-full mt-4 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-4">📦</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2">
                  No se encontraron productos de mayoreo
                </h3>
                <p className="text-gray-500 text-sm sm:text-base">
                  Intenta cambiar los filtros o la búsqueda
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200">
                    {/* Product Image */}
                    <div className="aspect-w-16 aspect-h-12 bg-gray-100 relative">
                      <img
                        src={product.imageUrl || '/images/default-wholesale.jpg'}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/default-wholesale.jpg';
                        }}
                      />
                      {product.isFeatured && (
                        <div className="absolute top-3 left-3 bg-primary text-white px-2 py-1 rounded-full text-xs font-medium">
                          Destacado
                        </div>
                      )}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-medium">Sin Stock</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <div className="mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                      </div>

                      {/* Product Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Precio por caja:</span>
                          <span className="font-semibold text-primary text-lg">
                            ${product.pricePerBox.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Unidades por caja:</span>
                          <span className="font-medium">{product.unitsPerBox} {product.unitType}</span>
                        </div>
                        <div className="flex items-center justify-between text-base">
                          <span className="text-gray-600">Precio por {product.unitType}:</span>
                          <span className="font-semibold text-green-600">
                            {product.unitsPerBox > 0
                              ? `$${(product.pricePerBox / product.unitsPerBox).toFixed(2)}`
                              : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Pedido mínimo:</span>
                          <span className="font-medium">{product.minimumOrder} cajas</span>
                        </div>
                      </div>

                      {/* Quantity Selector */}
                      {product.inStock && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cantidad de cajas:
                          </label>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleQuantityChange(
                                product.id, 
                                Math.max((quantities[product.id] || product.minimumOrder) - 1, product.minimumOrder)
                              )}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                              disabled={(quantities[product.id] || product.minimumOrder) <= product.minimumOrder}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min={product.minimumOrder}
                              value={quantities[product.id] || product.minimumOrder}
                              onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value) || product.minimumOrder)}
                              className="w-20 text-center py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                            <button
                              onClick={() => handleQuantityChange(
                                product.id, 
                                (quantities[product.id] || product.minimumOrder) + 1
                              )}
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            Total: {((quantities[product.id] || product.minimumOrder) * product.unitsPerBox)} {product.unitType}
                            (${((quantities[product.id] || product.minimumOrder) * product.pricePerBox).toFixed(2)})
                          </div>
                        </div>
                      )}

                      {/* Add to Cart Button */}
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                          product.inStock
                            ? 'bg-primary text-white hover:bg-blue-800 hover:shadow-lg'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCartIcon className="h-5 w-5" />
                        {product.inStock ? 'Agregar al Carrito' : 'Sin Stock'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filters Modal */}
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileFiltersOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Categorías</label>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setIsMobileFiltersOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todas las categorías
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsMobileFiltersOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters Button */}
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setIsMobileFiltersOpen(false);
                  }}
                  className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        )}

        {/* Info Banner */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <InformationCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Información sobre Ventas al Mayoreo</h4>
              <p className="text-blue-800 text-sm">
                • Todos los precios son por caja completa<br/>
                • Cada producto tiene un pedido mínimo específico<br/>
                • Precios especiales para pedidos grandes<br/>
                • Entrega programada disponible para mayoristas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WholesalePage;
