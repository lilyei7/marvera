import React, { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  unit: string;
  isFeatured?: boolean;
}

const FeaturedProductsAdmin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';
      const response = await fetch(`${API_BASE_URL}/api/products`);
      
      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }
      
      const data = await response.json();
      
      // Simular productos con algunos marcados como destacados
      const productsWithFeatured = data.products.map((product: any, index: number) => ({
        id: product.id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.categoryName,
        inStock: product.inStock,
        unit: product.unit || 'kg',
        isFeatured: index < 3 // Los primeros 3 como destacados por defecto
      }));
      
      setProducts(productsWithFeatured);
      setError(null);
    } catch (err) {
      setError('Error al cargar productos de la base de datos');
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (productId: string) => {
    try {
      // Optimistic update
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, isFeatured: !product.isFeatured }
            : product
        )
      );

      // TODO: Llamada a la API para actualizar en la base de datos
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/featured`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          isFeatured: !products.find(p => p.id === productId)?.isFeatured 
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar producto destacado');
      }

      console.log('✅ Producto destacado actualizado en la base de datos');
    } catch (err) {
      console.warn('⚠️ Error al actualizar en la base de datos, usando solo cambio local');
      // El cambio optimista ya se aplicó, no revertimos para esta demo
    }
  };

  const featuredProducts = products.filter(p => p.isFeatured);
  const availableProducts = products.filter(p => !p.isFeatured);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3">Cargando productos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchProducts}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestión de Productos Destacados</h2>
      
      {/* Productos Destacados Actuales */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Productos Destacados Actuales ({featuredProducts.length}/3)
        </h3>
        
        {featuredProducts.length === 0 ? (
          <p className="text-gray-500">No hay productos destacados seleccionados</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{product.name}</h4>
                  <button
                    onClick={() => toggleFeatured(product.id)}
                    className="text-yellow-500 hover:text-yellow-600"
                  >
                    <StarSolidIcon className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-primary">${product.price}</span>
                  <span className="text-xs text-gray-500">{product.category}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Productos Disponibles */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Productos Disponibles
        </h3>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
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
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destacar
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {availableProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${product.price} / {product.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.inStock 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.inStock ? 'En Stock' : 'Sin Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => toggleFeatured(product.id)}
                      disabled={featuredProducts.length >= 3}
                      className={`${
                        featuredProducts.length >= 3 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-gray-400 hover:text-yellow-500'
                      }`}
                    >
                      <StarIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProductsAdmin;
