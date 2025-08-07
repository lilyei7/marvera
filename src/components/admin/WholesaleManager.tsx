import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

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
  imageUrl: string[];
  isFeatured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Category {
  id: number;
  name: string;
}

const WholesaleManager: React.FC = () => {
  const [products, setProducts] = useState<WholesaleProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<WholesaleProduct | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerBox: '',
    unitsPerBox: '', // Ahora representa kg por caja
    unitType: 'caja', // Siempre será caja
    categoryId: '',
    stock: '',
    minimumOrder: '1',
    image: null as File | null,
    isFeatured: false
  });

  // Calcular precio por kg automáticamente
  const calculatePricePerKg = () => {
    const price = parseFloat(formData.pricePerBox);
    const kgPerBox = parseFloat(formData.unitsPerBox);
    
    if (price > 0 && kgPerBox > 0) {
      return (price / kgPerBox).toFixed(2);
    }
    return '0.00';
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://marvera.mx';

  useEffect(() => {
    fetchWholesaleProducts();
    fetchCategories();
  }, []);

  const fetchWholesaleProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/wholesale-products/admin/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Error al cargar productos de mayoreo');
      
      const data = await response.json();
      console.log('🏪 Wholesale admin data received:', data);
      
      // Proteger contra diferentes formatos de respuesta
      let productsArray: WholesaleProduct[] = [];
      
      if (data && data.success && Array.isArray(data.data)) {
        productsArray = data.data;
      } else if (Array.isArray(data)) {
        productsArray = data;
      } else if (data && Array.isArray(data.products)) {
        productsArray = data.products;
      } else {
        console.warn('⚠️ Unexpected data format:', data);
        productsArray = [];
      }
      
      console.log('🏪 Processed wholesale products:', productsArray.length);
      setProducts(productsArray);
      setError(null);
    } catch (error) {
      console.error('Error al cargar productos de mayoreo:', error);
      setError('Error al cargar productos de mayoreo de la base de datos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/categories`);
      if (!response.ok) throw new Error('Error al cargar categorías');
      
      const data = await response.json();
      console.log('📂 Categories data received:', data);
      
      // Proteger contra diferentes formatos de respuesta
      let categoriesArray: any[] = [];
      
      if (data && data.success && Array.isArray(data.data)) {
        categoriesArray = data.data;
      } else if (Array.isArray(data.categories)) {
        categoriesArray = data.categories;
      } else if (Array.isArray(data)) {
        categoriesArray = data;
      } else {
        console.warn('⚠️ Unexpected categories format:', data);
        categoriesArray = [];
      }
      
      console.log('📂 Processed categories:', categoriesArray.length);
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setCategories([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.pricePerBox || !formData.unitsPerBox) {
      alert('Por favor, completa todos los campos requeridos');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('pricePerBox', formData.pricePerBox);
      formDataToSend.append('unitsPerBox', formData.unitsPerBox);
      formDataToSend.append('unitType', formData.unitType);
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('minimumOrder', formData.minimumOrder);
      formDataToSend.append('isFeatured', formData.isFeatured.toString());
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const url = editingProduct 
        ? `${API_BASE_URL}/api/wholesale-products/admin/${editingProduct.id}`
        : `${API_BASE_URL}/api/wholesale-products/admin/create`;
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar producto');
      }

      await fetchWholesaleProducts();
      resetForm();
      setIsModalOpen(false);
      
      alert(editingProduct ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el producto: ' + (error as Error).message);
    }
  };

  const handleEdit = (product: WholesaleProduct) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      pricePerBox: product.pricePerBox.toString(),
      unitsPerBox: product.unitsPerBox.toString(),
      unitType: 'caja', // Siempre será caja
      categoryId: product.categoryId?.toString() || '',
      stock: product.stock.toString(),
      minimumOrder: product.minimumOrder.toString(),
      image: null,
      isFeatured: product.isFeatured
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (product: WholesaleProduct) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar "${product.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/wholesale-products/admin/${product.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Error al eliminar producto');

      await fetchWholesaleProducts();
      alert('Producto eliminado correctamente');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el producto');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      pricePerBox: '',
      unitsPerBox: '',
      unitType: 'caja',
      categoryId: '',
      stock: '',
      minimumOrder: '1',
      image: null,
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
      <AdminLayout title="Gestión de Productos de Mayoreo" subtitle="Cargando...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="Gestión de Productos de Mayoreo"
      subtitle="Administra el catálogo de productos para ventas al por mayor"
    >
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div></div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Agregar Producto de Mayoreo
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar productos de mayoreo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Product Image */}
            <div className="aspect-w-16 aspect-h-12 bg-gray-100">
              <img
                src={Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl || '/images/default-wholesale.jpg'}
                alt={product.name}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/default-wholesale.jpg';
                }}
              />
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                {product.isFeatured && (
                  <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                    Destacado
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
              
              <div className="space-y-1 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio por caja:</span>
                  <span className="font-semibold text-primary">${product.pricePerBox}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kg por caja:</span>
                  <span>{product.unitsPerBox} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Precio por kg:</span>
                <span className="font-bold text-blue-700 text-lg md:text-base md:font-semibold md:text-blue-800">
                    ${Number(product.pricePerBox / product.unitsPerBox).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / kg
                </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mín. pedido:</span>
                  <span>{product.minimumOrder} cajas</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Stock:</span>
                  <span className={product.inStock ? 'text-green-600' : 'text-red-600'}>
                    {product.stock} cajas
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                >
                  <PencilIcon className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(product)}
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
              ? 'No se encontraron productos de mayoreo con los filtros aplicados'
              : 'No hay productos de mayoreo registrados'
            }
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Editar Producto de Mayoreo' : 'Nuevo Producto de Mayoreo'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Ej: Camarones Jumbo"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Descripción detallada del producto..."
                  />
                </div>

                {/* Price and Units */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio por Caja *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.pricePerBox}
                      onChange={(e) => setFormData(prev => ({ ...prev, pricePerBox: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kg por Caja *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={formData.unitsPerBox}
                      onChange={(e) => setFormData(prev => ({ ...prev, unitsPerBox: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Ej: 5.5"
                    />
                  </div>
                </div>

                {/* Calculated Price per Kg Display */}
                {formData.pricePerBox && formData.unitsPerBox && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">
                        💡 Precio por Kg (calculado automáticamente):
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        ${calculatePricePerKg()} / kg
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Cálculo: ${formData.pricePerBox} ÷ {formData.unitsPerBox} kg = ${calculatePricePerKg()} por kg
                    </p>
                  </div>
                )}

                {/* Category and Stock */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock (Cajas)
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Stock and Minimum Order */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock (Cajas)
                    </label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pedido Mínimo (Cajas)
                    </label>
                    <input
                      type="number"
                      value={formData.minimumOrder}
                      onChange={(e) => setFormData(prev => ({ ...prev, minimumOrder: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="1"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen del Producto
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.files?.[0] || null }))}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                      <PhotoIcon className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        {formData.image ? formData.image.name : 'Haz clic para subir una imagen'}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Featured */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">
                    Producto destacado
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    {editingProduct ? 'Actualizar' : 'Crear'} Producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default WholesaleManager;

