import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import OptimizedImage from '../common/OptimizedImage';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  categoryName: string;
  image: string;
  inStock: boolean;
  unit: string;
  isFeatured: boolean;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  emoji: string;
}

const ProductsManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    unit: 'kg',
    inStock: true,
    isFeatured: false
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/products`);
      if (!response.ok) throw new Error('Error al cargar productos');
      
      const data = await response.json();
      setProducts(data.products || []);
      setError(null);
    } catch (error) {
      console.error('Error:', error);
      setError('Error al cargar productos');
      // Datos de ejemplo para desarrollo
      setProducts([
        {
          id: '1',
          name: 'Salmón Atlántico Premium',
          description: 'Salmón fresco del Atlántico Norte, ideal para sushi y parrilla',
          price: 45.99,
          category: 'pescados',
          categoryName: 'Pescados',
          image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop&crop=center',
          inStock: true,
          unit: 'kg',
          isFeatured: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Camarones Gigantes',
          description: 'Camarones frescos tamaño jumbo, perfectos para cualquier ocasión',
          price: 35.50,
          category: 'camarones',
          categoryName: 'Camarones',
          image: 'https://images.unsplash.com/photo-1553611892-7ba35ad6f0dd?w=400&h=300&fit=crop&crop=center',
          inStock: true,
          unit: 'kg',
          isFeatured: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Langosta Viva Maine',
          description: 'Langosta fresca viva del Maine, entrega garantizada',
          price: 89.99,
          category: 'langostas',
          categoryName: 'Langostas',
          image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=400&h=300&fit=crop&crop=center',
          inStock: true,
          unit: 'pz',
          isFeatured: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '4',
          name: 'Ostras Frescas',
          description: 'Ostras frescas del Pacífico, cosechadas diariamente',
          price: 24.99,
          category: 'ostras',
          categoryName: 'Ostras',
          image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400&h=300&fit=crop&crop=center',
          inStock: true,
          unit: 'docena',
          isFeatured: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '5',
          name: 'Cangrejo Real',
          description: 'Cangrejo real de Alaska, sabor incomparable',
          price: 125.00,
          category: 'cangrejos',
          categoryName: 'Cangrejos',
          image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop&crop=center',
          inStock: false,
          unit: 'kg',
          isFeatured: false,
          createdAt: new Date().toISOString()
        },
        {
          id: '6',
          name: 'Mejillones Azules',
          description: 'Mejillones frescos cultivados en aguas limpias',
          price: 18.50,
          category: 'moluscos',
          categoryName: 'Moluscos',
          image: 'https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=400&h=300&fit=crop&crop=center',
          inStock: true,
          unit: 'kg',
          isFeatured: false,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      if (!response.ok) throw new Error('Error al cargar categorías');
      
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error:', error);
      // Categorías de ejemplo
      setCategories([
        { id: 'pescados', name: 'Pescados', emoji: '🐟' },
        { id: 'camarones', name: 'Camarones', emoji: '🦐' },
        { id: 'ostras', name: 'Ostras', emoji: '🦪' },
        { id: 'langostas', name: 'Langostas', emoji: '🦞' },
        { id: 'cangrejos', name: 'Cangrejos', emoji: '🦀' },
        { id: 'moluscos', name: 'Moluscos', emoji: '🐚' }
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingProduct 
        ? `${API_BASE_URL}/api/products/${editingProduct.id}`
        : `${API_BASE_URL}/api/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        }),
      });

      if (!response.ok) throw new Error('Error al guardar producto');

      await fetchProducts();
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el producto');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image,
      unit: product.unit,
      inStock: product.inStock,
      isFeatured: product.isFeatured
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar producto');

      await fetchProducts();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el producto');
    }
  };

  const toggleFeatured = async (product: Product) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          isFeatured: !product.isFeatured
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar producto');

      await fetchProducts();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el producto');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      unit: 'kg',
      inStock: true,
      isFeatured: false
    });
    setEditingProduct(null);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Productos</h2>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Agregar Producto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">Todas las categorías</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.emoji} {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Product Image */}
            <div className="h-48 bg-gray-100 relative overflow-hidden">
              <OptimizedImage
                src={product.image || ''}
                alt={product.name}
                className="w-full h-full"
                fallbackEmoji="🐟"
                priority={false}
              />
              
              {/* Status badges */}
              <div className="absolute top-2 left-2">
                {product.isFeatured && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                    ⭐ Destacado
                  </span>
                )}
              </div>
              <div className="absolute top-2 right-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  product.inStock 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {product.inStock ? 'En Stock' : 'Agotado'}
                </span>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-primary">${product.price}</span>
                <span className="text-sm text-gray-500">por {product.unit}</span>
              </div>
              
              <div className="text-sm text-gray-500 mb-3">
                Categoría: {product.categoryName || product.category}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                >
                  <PencilIcon className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => toggleFeatured(product)}
                  className={`flex-1 px-3 py-2 rounded text-sm transition-colors flex items-center justify-center gap-1 ${
                    product.isFeatured
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
                >
                  <EyeIcon className="h-4 w-4" />
                  {product.isFeatured ? 'Destacado' : 'Destacar'}
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors flex items-center justify-center"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {searchTerm || selectedCategory !== 'all' 
              ? 'No se encontraron productos con los filtros aplicados'
              : 'No hay productos registrados'
            }
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Producto
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.emoji} {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unidad
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="kg">Kilogramo</option>
                      <option value="lb">Libra</option>
                      <option value="pz">Pieza</option>
                      <option value="bandeja">Bandeja</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-4 pt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.inStock}
                        onChange={(e) => setFormData({...formData, inStock: e.target.checked})}
                        className="mr-2"
                      />
                      En Stock
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                        className="mr-2"
                      />
                      Destacado
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL de la Imagen
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    {editingProduct ? 'Actualizar' : 'Crear'} Producto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManager;
