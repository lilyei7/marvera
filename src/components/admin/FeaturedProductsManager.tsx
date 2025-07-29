import React, { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isFeatured: boolean;
  freshness: string;
}

const FeaturedProductsManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  // Simular carga de productos
  useEffect(() => {
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Salmón Salvaje',
        description: 'Origen sostenible, sabor intenso',
        price: 45000,
        imageUrl: '/images/salmon.jpg',
        category: 'Pescados',
        isFeatured: true,
        freshness: 'Fresco'
      },
      {
        id: '2',
        name: 'Langosta Viva de Maine',
        description: 'Entrega viva para máxima frescura',
        price: 85000,
        imageUrl: '/images/lobster.jpg',
        category: 'Crustáceos',
        isFeatured: true,
        freshness: 'Viva'
      },
      {
        id: '3',
        name: 'Ostras Premium',
        description: 'Cosechadas a diario, saladas y deliciosas',
        price: 12000,
        imageUrl: '/images/oysters.jpg',
        category: 'Moluscos',
        isFeatured: true,
        freshness: 'Premium'
      },
      {
        id: '4',
        name: 'Pez Espada Fresco',
        description: 'Ideal para asados y parrillas',
        price: 38000,
        imageUrl: '/images/swordfish.jpg',
        category: 'Pescados',
        isFeatured: false,
        freshness: 'Fresco'
      },
      {
        id: '5',
        name: 'Camarones Jumbo',
        description: 'Tamaño extra grande, perfectos para cualquier ocasión',
        price: 32000,
        imageUrl: '/images/shrimp.jpg',
        category: 'Crustáceos',
        isFeatured: false,
        freshness: 'Ultra Fresh'
      }
    ];
    
    setProducts(mockProducts);
    setFeaturedProducts(mockProducts.filter(p => p.isFeatured));
  }, []);

  const toggleFeatured = (productId: string) => {
    const updatedProducts = products.map(product => 
      product.id === productId 
        ? { ...product, isFeatured: !product.isFeatured }
        : product
    );
    
    setProducts(updatedProducts);
    setFeaturedProducts(updatedProducts.filter(p => p.isFeatured));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Productos Destacados</h2>
        <p className="text-gray-600">Gestiona qué productos aparecen en la página principal</p>
      </div>

      {/* Vista previa de productos destacados */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vista Previa (Página Principal)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
          {featuredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group">
              <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <div className="w-28 h-20 bg-gradient-to-br from-orange-200 to-orange-300 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-4xl">
                      {product.category === 'Pescados' ? '🐟' : 
                       product.category === 'Crustáceos' ? '🦞' : '🦪'}
                    </span>
                  </div>
                </div>
                <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                  {product.freshness}
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h4>
                <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                <div className="text-lg font-bold text-primary">{formatPrice(product.price)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lista de todos los productos */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Todos los Productos</h3>
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
                  Frescura
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destacado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                          <span className="text-xl">
                            {product.category === 'Pescados' ? '🐟' : 
                             product.category === 'Crustáceos' ? '🦞' : '🦪'}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      product.freshness === 'Ultra Fresh' ? 'bg-green-100 text-green-800' :
                      product.freshness === 'Fresco' ? 'bg-emerald-100 text-emerald-800' :
                      product.freshness === 'Viva' ? 'bg-red-100 text-red-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {product.freshness}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => toggleFeatured(product.id)}
                      className={`transition-colors ${
                        product.isFeatured 
                          ? 'text-yellow-400 hover:text-yellow-500' 
                          : 'text-gray-300 hover:text-gray-400'
                      }`}
                    >
                      {product.isFeatured ? (
                        <StarIcon className="h-6 w-6" />
                      ) : (
                        <StarOutlineIcon className="h-6 w-6" />
                      )}
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

export default FeaturedProductsManager;
