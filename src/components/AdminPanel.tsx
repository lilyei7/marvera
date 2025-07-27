import React, { useState, useEffect } from 'react';
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
import MultiImageUploader from './MultiImageUploader';
import ProductImageViewer from './ProductImageViewer';
import { ToastContainer, useToast } from './Toast';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AdminPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items: products } = useAppSelector((state: any) => state.products);
  const { user } = useAppSelector((state: any) => state.auth);
  const { toasts, showSuccess, showError, removeToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'users'>('dashboard');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    category_id: 1,
    stock: '',
    unit: 'kg',
    images: [] as string[], // Múltiples imágenes
    imageUrl: '', // Para compatibilidad
    isFeatured: false
  });

  // Estados locales para el admin
  const [adminProducts, setAdminProducts] = useState<any[]>([]);

  // Cargar categorías y productos al montar el componente
  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/products`);
      
      if (response.ok) {
        const data = await response.json();
        setAdminProducts(data.products || []);
      } else {
        showError('Error', 'No se pudieron cargar los productos');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      showError('Error', 'Error de conexión al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/products/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        console.warn('Could not load categories, using defaults');
        // Usar categorías por defecto si falla la carga
        setCategories([
          { id: 1, name: 'Pescados' },
          { id: 2, name: 'Mariscos' },
          { id: 3, name: 'Crustáceos' },
          { id: 4, name: 'Moluscos' }
        ]);
      }
    } catch (error) {
      console.warn('Error loading categories, using defaults:', error);
      // Usar categorías por defecto si hay error de conexión
      setCategories([
        { id: 1, name: 'Pescados' },
        { id: 2, name: 'Mariscos' },
        { id: 3, name: 'Crustáceos' },
        { id: 4, name: 'Moluscos' }
      ]);
    }
  };

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

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('Error', 'No tienes autorización para realizar esta acción');
        setLoading(false);
        return;
      }

      const productData = {
        name: productForm.name,
        slug: productForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: productForm.description,
        price: parseFloat(productForm.price),
        category_id: productForm.category_id,
        stock: parseInt(productForm.stock),
        unit: productForm.unit,
        images: productForm.images,
        isActive: true,
        isFeatured: productForm.isFeatured
      };

      const url = editingProduct 
        ? `${API_BASE_URL}/api/products/${editingProduct.id}`
        : `${API_BASE_URL}/api/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      });

      if (response.ok) {
        const data = await response.json();
        
        if (editingProduct) {
          dispatch(updateProduct(data.product));
          showSuccess('¡Éxito!', 'Producto actualizado correctamente');
        } else {
          dispatch(addProduct(data.product));
          showSuccess('¡Éxito!', 'Producto creado correctamente');
        }

        // Recargar la lista de productos desde la base de datos
        await loadProducts();
        
        setShowProductModal(false);
        resetProductForm();
      } else {
        const errorData = await response.json();
        showError('Error', errorData.message || 'Error al guardar el producto');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      showError('Error', 'Error de conexión al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      price: '',
      description: '',
      category_id: 1,
      stock: '',
      unit: 'kg',
      images: [],
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
      images: product.images || (product.imageUrl ? [product.imageUrl] : []),
      imageUrl: product.imageUrl || '',
      isFeatured: product.isFeatured
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showError('Error', 'No tienes autorización para realizar esta acción');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        dispatch(deleteProduct(productId));
        showSuccess('¡Éxito!', 'Producto eliminado correctamente');
        // Recargar la lista de productos desde la base de datos
        await loadProducts();
      } else {
        const errorData = await response.json();
        showError('Error', errorData.message || 'Error al eliminar el producto');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showError('Error', 'Error de conexión al eliminar el producto');
    }
  };

  // Asegurar que adminProducts está definido y es un array
  const safeProducts = Array.isArray(adminProducts) ? adminProducts : [];

  const stats = {
    totalProducts: safeProducts.length,
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
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 sm:py-4 lg:py-6 gap-3 sm:gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-2xl sm:text-3xl lg:text-4xl animate-float">👨‍💼</div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-primary leading-tight">Panel de Administración</h1>
                <p className="text-gray-600 text-xs sm:text-sm lg:text-base">Bienvenido, {user.firstName} {user.lastName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="text-right">
                <div className="text-xs sm:text-sm text-gray-500">Admin desde</div>
                <div className="font-semibold text-primary text-xs sm:text-sm lg:text-base">MarVera 2024</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Tabs Navigation */}
        <div className="flex flex-wrap sm:flex-nowrap overflow-x-auto space-x-1 bg-gray-100 p-1 rounded-lg sm:rounded-xl mb-4 sm:mb-6 lg:mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg font-medium transition-all duration-300 whitespace-nowrap text-xs sm:text-sm ${
                activeTab === tab.id
                  ? 'bg-white text-primary shadow-md transform scale-105'
                  : 'text-gray-500 hover:text-primary hover:bg-white/50'
              }`}
            >
              <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden xs:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg p-3 sm:p-4 lg:p-6 hover-lift transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Productos</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-primary">{stats.totalProducts}</p>
                  </div>
                  <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
                    <ShoppingBagIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-primary" />
                  </div>
                </div>
                <div className="mt-2 sm:mt-3 lg:mt-4 flex items-center text-xs sm:text-sm">
                  <span className="text-green-600 font-medium">+12%</span>
                  <span className="text-gray-500 ml-1 sm:ml-2">vs mes anterior</span>
                </div>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg p-3 sm:p-4 lg:p-6 hover-lift transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Pedidos</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-secondary">{stats.totalOrders}</p>
                  </div>
                  <div className="bg-secondary/10 p-2 sm:p-3 rounded-full">
                    <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-secondary" />
                  </div>
                </div>
                <div className="mt-2 sm:mt-3 lg:mt-4 flex items-center text-xs sm:text-sm">
                  <span className="text-green-600 font-medium">+8%</span>
                  <span className="text-gray-500 ml-1 sm:ml-2">vs mes anterior</span>
                </div>
              </div>

              <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-md sm:shadow-lg p-3 sm:p-4 lg:p-6 hover-lift transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Usuarios</p>
                    <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-accent">{stats.totalUsers}</p>
                  </div>
                  <div className="bg-accent/10 p-2 sm:p-3 rounded-full">
                    <UsersIcon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-accent" />
                  </div>
                </div>
                <div className="mt-2 sm:mt-3 lg:mt-4 flex items-center text-xs sm:text-sm">
                  <span className="text-green-600 font-medium">+24%</span>
                  <span className="text-gray-500 ml-1 sm:ml-2">vs mes anterior</span>
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
                className="bg-vibrant-blue hover:bg-dark-blue text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-2 btn-gradient-primary"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Agregar Producto</span>
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {safeProducts.map((product: any, index: number) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover-lift transition-all duration-300 animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="relative">
                    {/* Mostrar múltiples imágenes con carrusel */}
                    {product.images && product.images.length > 0 ? (
                      <ProductImageViewer
                        images={product.images}
                        productName={product.name}
                        className="w-full h-40 sm:h-48"
                        showDots={true}
                        showCounter={true}
                        showThumbnails={true}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-light-peach to-light-beige flex items-center justify-center">
                        <img
                          src={product.imageUrl || `https://via.placeholder.com/300x200/4d82bc/FFFFFF?text=${product.name.charAt(0)}`}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/300x200/4d82bc/FFFFFF?text=🐟';
                          }}
                        />
                      </div>
                    )}
                    {product.isFeatured && (
                      <div className="absolute top-2 right-2 bg-vibrant-blue text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Destacado
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-vibrant-blue">${product.price}</span>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={productForm.category_id}
                    onChange={(e) => setProductForm({...productForm, category_id: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
                    required
                  >
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))
                    ) : (
                      <option value={1}>Cargando categorías...</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Galería de Imágenes Mejorada */}
              <div>
                <MultiImageUploader
                  images={productForm.images}
                  onChange={(images) => setProductForm({...productForm, images})}
                  maxImages={5}
                  title="Imágenes del Producto"
                  description="Agrega hasta 5 imágenes usando URLs o emojis marinos para representar tu producto"
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
                  disabled={loading}
                  className="flex-1 bg-primary hover:bg-secondary text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 hover:scale-105 btn-gradient-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      {editingProduct ? 'Actualizando...' : 'Creando...'}
                    </div>
                  ) : (
                    `${editingProduct ? 'Actualizar' : 'Crear'} Producto`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Container para notificaciones */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default AdminPanel;
