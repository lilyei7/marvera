import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import AdminLayout from '../../layouts/AdminLayout';
import ProductModal from './ProductModal';
import type { Product, ProductCategory } from '../../types';

const ProductsAdmin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'all'>('all');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://marvera.mx';

  const categories: (ProductCategory | 'all')[] = ['all', 'pescados', 'camarones', 'ostras', 'langostas', 'cangrejos', 'moluscos', 'otros'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay token de autenticación');
        setProducts([]);
        return;
      }
      
      console.log('🔐 Fetching admin products...');
      
      const response = await fetch(`${API_BASE_URL}/api/admin/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Raw data received:', data);
      
      // Manejar diferentes formatos de respuesta de forma defensiva
      let productsArray: any[] = [];
      
      try {
        if (data && typeof data === 'object') {
          if (data.success && Array.isArray(data.data)) {
            productsArray = data.data;
            console.log('✅ Using data.data array:', productsArray.length);
          } else if (Array.isArray(data.products)) {
            productsArray = data.products;
            console.log('✅ Using data.products array:', productsArray.length);
          } else if (Array.isArray(data)) {
            productsArray = data;
            console.log('✅ Using direct array:', productsArray.length);
          } else {
            console.warn('⚠️ Unexpected data format, using empty array:', data);
            productsArray = [];
          }
        } else {
          console.warn('⚠️ Data is not an object, using empty array:', data);
          productsArray = [];
        }
      } catch (parseError) {
        console.error('❌ Error parsing response data:', parseError);
        productsArray = [];
      }
      
      // Validar que sea un array
      if (!Array.isArray(productsArray)) {
        console.error('❌ Products data is not an array:', productsArray);
        productsArray = [];
      }
      
      // Validar y normalizar cada producto
      const validatedProducts: Product[] = productsArray
        .filter(item => item && typeof item === 'object') // Filtrar items válidos
        .map((product: any, index: number) => {
          try {
            return {
              id: product.id ? String(product.id) : `temp-${index}`,
              name: product.name || 'Sin nombre',
              description: product.description || '',
              price: Number(product.price) || 0,
              category: product.category?.name || product.categoryName || product.category || 'otros',
              imageUrl: product.imageUrl || product.image || (product.images && Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : ''),
              inStock: product.inStock !== undefined ? Boolean(product.inStock) : Number(product.stock) > 0,
              stock: Number(product.stock) || 0,
              unit: product.unit || 'kg',
              isFeatured: Boolean(product.isFeatured),
              slug: product.slug || '',
              comparePrice: product.comparePrice ? Number(product.comparePrice) : undefined,
              images: Array.isArray(product.images) ? product.images : [],
              origin: product.origin || '',
              freshness: product.freshness || '',
              weight: Number(product.weight) || 1,
              categoryName: product.category?.name || product.categoryName || product.category || 'otros'
            } as Product;
          } catch (itemError) {
            console.error('❌ Error processing product item:', itemError, product);
            return null;
          }
        })
        .filter((product): product is Product => product !== null); // Filtrar productos válidos
      
      console.log('✅ Validated products:', validatedProducts.length);
      setProducts(validatedProducts);
      
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Error al cargar productos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos de forma completamente segura
  const filteredProducts = React.useMemo(() => {
    try {
      if (!Array.isArray(products)) {
        console.warn('⚠️ Products is not an array for filtering:', products);
        return [];
      }

      return products.filter((product) => {
        try {
          if (!product || typeof product !== 'object') {
            return false;
          }
          
          const searchLower = (searchTerm || '').toLowerCase();
          const productName = (product.name || '').toLowerCase();
          const productDesc = (product.description || '').toLowerCase();
          
          const matchesSearch = !searchTerm || 
            productName.includes(searchLower) || 
            productDesc.includes(searchLower);
          
          const matchesCategory = selectedCategory === 'all' || 
            product.category === selectedCategory;
          
          return matchesSearch && matchesCategory;
        } catch (filterError) {
          console.error('❌ Error filtering product:', filterError, product);
          return false;
        }
      });
    } catch (error) {
      console.error('❌ Error in filteredProducts calculation:', error);
      return [];
    }
  }, [products, searchTerm, selectedCategory]);

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar producto');
      }

      await fetchProducts(); // Recargar productos
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar producto');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error al cargar productos</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestión de Productos</h1>
            <p className="text-gray-600">
              Total: {Array.isArray(products) ? products.length : 0} productos | 
              Mostrando: {Array.isArray(filteredProducts) ? filteredProducts.length : 0}
            </p>
          </div>
          <button
            onClick={handleCreateProduct}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Nuevo Producto
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            
            {/* Category Filter */}
            <div className="lg:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as ProductCategory | 'all')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              >
                <option value="all">Todas las categorías</option>
                {categories.slice(1).map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white rounded-lg shadow-sm border">
          {!Array.isArray(filteredProducts) || filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-5xl mb-4">🐟</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {!Array.isArray(products) || products.length === 0 ? 'No hay productos' : 'No se encontraron productos'}
              </h3>
              <p className="text-gray-500">
                {!Array.isArray(products) || products.length === 0 
                  ? 'Comienza agregando tu primer producto'
                  : 'Intenta cambiar los filtros de búsqueda'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-12 w-12 flex-shrink-0">
                            <img
                              className="h-12 w-12 rounded-lg object-cover"
                              src={product.imageUrl || '/images/default.webp'}
                              alt={product.name}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/default.webp';
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category || 'Sin categoría'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${product.price?.toFixed(2) || '0.00'} / {product.unit || 'kg'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.inStock ? 'En Stock' : 'Agotado'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.inStock 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.inStock ? 'Disponible' : 'Agotado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Editar"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Eliminar"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Product Modal */}
        {showModal && (
          <ProductModal
            product={editingProduct}
            isOpen={showModal}
            categories={categories.filter(cat => cat !== 'all')}
            onClose={() => {
              setShowModal(false);
              setEditingProduct(null);
            }}
            onSave={() => {
              setShowModal(false);
              setEditingProduct(null);
              fetchProducts();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default ProductsAdmin;
