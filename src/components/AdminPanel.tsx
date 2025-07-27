import React, { useState } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ChartBarIcon,
  UsersIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addProduct, updateProduct, deleteProduct } from '../store/slices/productsSlice';

const AdminPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { products } = useAppSelector((state: any) => state.products);
  const { user } = useAppSelector((state: any) => state.auth);
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'users'>('dashboard');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    category_id: 1,
    stock: '',
    unit: 'kg',
    imageUrl: '',
    isFeatured: false
  });

  // Verificar si el usuario es admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-light flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md animate-bounce-gentle">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-primary mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-6">No tienes permisos de administrador para acceder a esta sección.</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg transition-all duration-300 hover:scale-105"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...productForm,
      id: editingProduct ? editingProduct.id : `${Date.now()}`,
      slug: productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock),
      isActive: true,
      category: 'pescados' as any, // Temporal
      inStock: true,
      origin: 'Local',
      freshness: 'Fresh',
      weight: 1,
      createdAt: editingProduct ? editingProduct.createdAt : new Date(),
      updatedAt: new Date()
    };

    if (editingProduct) {
      dispatch(updateProduct(productData));
    } else {
      dispatch(addProduct(productData));
    }

    setShowProductModal(false);
    resetProductForm();
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      price: '',
      description: '',
      category_id: 1,
      stock: '',
      unit: 'kg',
      imageUrl: '',
      isFeatured: false
    });
    setEditingProduct(null);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      description: product.description || '',
      category_id: product.category_id,
      stock: product.stock.toString(),
      unit: product.unit,
      imageUrl: product.imageUrl || '',
      isFeatured: product.isFeatured
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = (productId: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      dispatch(deleteProduct(productId));
    }
  };

  const stats = {
    totalProducts: products.length,
    totalOrders: 24, // Simulado
    totalUsers: 156, // Simulado
    totalRevenue: 12543.50 // Simulado
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'products', label: 'Productos', icon: ShoppingBagIcon },
    { id: 'orders', label: 'Pedidos', icon: CurrencyDollarIcon },
    { id: 'users', label: 'Usuarios', icon: UsersIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-light">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="text-4xl animate-float">👨‍💼</div>
              <div>
                <h1 className="text-3xl font-bold text-primary">Panel de Administración</h1>
                <p className="text-gray-600">Bienvenido, {user.firstName} {user.lastName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Admin desde</div>
                <div className="font-semibold text-primary">MarVera 2024</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs Navigation */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-white text-primary shadow-md transform scale-105'
                  : 'text-gray-500 hover:text-primary hover:bg-white/50'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 hover-lift transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Productos</p>
                    <p className="text-3xl font-bold text-primary">{stats.totalProducts}</p>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-full">
                    <ShoppingBagIcon className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">+12%</span>
                  <span className="text-gray-500 ml-2">vs mes anterior</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 hover-lift transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pedidos</p>
                    <p className="text-3xl font-bold text-secondary">{stats.totalOrders}</p>
                  </div>
                  <div className="bg-secondary/10 p-3 rounded-full">
                    <CurrencyDollarIcon className="h-8 w-8 text-secondary" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">+8%</span>
                  <span className="text-gray-500 ml-2">vs mes anterior</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 hover-lift transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Usuarios</p>
                    <p className="text-3xl font-bold text-accent">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-accent/10 p-3 rounded-full">
                    <UsersIcon className="h-8 w-8 text-accent" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">+24%</span>
                  <span className="text-gray-500 ml-2">vs mes anterior</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 hover-lift transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ingresos</p>
                    <p className="text-3xl font-bold text-green-600">${stats.totalRevenue}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <ChartBarIcon className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">+15%</span>
                  <span className="text-gray-500 ml-2">vs mes anterior</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
              <div className="space-y-4">
                {[
                  { action: 'Nuevo pedido', details: 'Pedido #1234 - $89.99', time: 'Hace 5 min', icon: '🛒' },
                  { action: 'Usuario registrado', details: 'Ana García se registró', time: 'Hace 12 min', icon: '👤' },
                  { action: 'Producto agregado', details: 'Salmón Atlántico Premium', time: 'Hace 1 hora', icon: '🐟' },
                  { action: 'Pedido completado', details: 'Pedido #1230 entregado', time: 'Hace 2 horas', icon: '✅' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                    <div className="text-2xl">{activity.icon}</div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-500">{activity.details}</p>
                    </div>
                    <div className="text-sm text-gray-400">{activity.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Products Management */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Gestión de Productos</h2>
              <button
                onClick={() => setShowProductModal(true)}
                className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-2 btn-gradient-primary"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Agregar Producto</span>
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product: any, index: number) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover-lift transition-all duration-300 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="relative">
                    <img
                      src={product.imageUrl || `https://via.placeholder.com/300x200/4d82bc/FFFFFF?text=${product.name.charAt(0)}`}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://via.placeholder.com/300x200/4d82bc/FFFFFF?text=🐟';
                      }}
                    />
                    {product.isFeatured && (
                      <div className="absolute top-2 right-2 bg-accent text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Destacado
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-primary">${product.price}</span>
                      <span className="text-sm text-gray-500">Stock: {product.stock} {product.unit}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditProduct(product)}
                        className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-1"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span>Editar</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-1"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Management */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Pedidos</h2>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <p className="text-center text-gray-500 py-12">
                🚧 Sección de pedidos en desarrollo...
              </p>
            </div>
          </div>
        )}

        {/* Users Management */}
        {activeTab === 'users' && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h2>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <p className="text-center text-gray-500 py-12">
                👥 Sección de usuarios en desarrollo...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-bounce-gentle">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-primary">
                {editingProduct ? 'Editar Producto' : 'Agregar Producto'}
              </h3>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  resetProductForm();
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl hover:scale-110 transition-all duration-200"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    placeholder="Ej: Salmón Atlántico Premium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unidad
                  </label>
                  <select
                    value={productForm.unit}
                    onChange={(e) => setProductForm({...productForm, unit: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                  >
                    <option value="kg">Kilogramo</option>
                    <option value="lb">Libra</option>
                    <option value="unidad">Unidad</option>
                    <option value="docena">Docena</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de Imagen
                </label>
                <input
                  type="url"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({...productForm, imageUrl: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                  placeholder="Descripción detallada del producto..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={productForm.isFeatured}
                  onChange={(e) => setProductForm({...productForm, isFeatured: e.target.checked})}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                  Producto destacado
                </label>
              </div>

              <div className="flex space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    resetProductForm();
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-all duration-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-secondary text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 btn-gradient-primary"
                >
                  {editingProduct ? 'Actualizar' : 'Crear'} Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
