import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon
} from '@heroicons/react/24/outline';

interface SpecialOffer {
  id: number;
  title: string;
  description: string;
  originalPrice: number;
  discountPrice: number;
  discountPercent?: number;
  imageUrl?: string;
  backgroundColor: string;
  isActive: boolean;
  isFeatured: boolean;
  validFrom: string;
  validUntil?: string;
  productIds?: string;
  maxRedemptions?: number;
  currentRedemptions: number;
  createdAt: string;
  updatedAt: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
}

const OffersManager: React.FC = () => {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    originalPrice: '',
    discountPrice: '',
    discountPercent: '',
    imageUrl: '',
    backgroundColor: '#1E3A8A',
    isActive: true,
    isFeatured: false,
    validUntil: '',
    productIds: [] as number[],
    maxRedemptions: ''
  });

  useEffect(() => {
    fetchOffers();
    fetchProducts();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://marvera.mx';
      const response = await fetch(`${API_BASE_URL}/api/admin/offers`);
      
      if (!response.ok) throw new Error('Error al obtener ofertas');
      
      const data = await response.json();
      setOffers(data.data || []);
    } catch (err) {
      setError('Error al cargar ofertas');
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://marvera.mx';
      const response = await fetch(`${API_BASE_URL}/api/admin/products`);
      
      if (!response.ok) throw new Error('Error al obtener productos');
      
      const data = await response.json();
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://marvera.mx';
      const url = editingOffer 
        ? `${API_BASE_URL}/api/admin/offers/${editingOffer.id}`
        : `${API_BASE_URL}/api/admin/offers`;
      
      const method = editingOffer ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        originalPrice: parseFloat(formData.originalPrice),
        discountPrice: parseFloat(formData.discountPrice),
        discountPercent: formData.discountPercent ? parseFloat(formData.discountPercent) : null,
        maxRedemptions: formData.maxRedemptions ? parseInt(formData.maxRedemptions) : null,
        productIds: formData.productIds
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Error al guardar oferta');

      await fetchOffers();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la oferta');
    }
  };

  const handleEdit = (offer: SpecialOffer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      originalPrice: offer.originalPrice.toString(),
      discountPrice: offer.discountPrice.toString(),
      discountPercent: offer.discountPercent?.toString() || '',
      imageUrl: offer.imageUrl || '',
      backgroundColor: offer.backgroundColor,
      isActive: offer.isActive,
      isFeatured: offer.isFeatured,
      validUntil: offer.validUntil ? offer.validUntil.split('T')[0] : '',
      productIds: offer.productIds ? JSON.parse(offer.productIds) : [],
      maxRedemptions: offer.maxRedemptions?.toString() || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta oferta?')) return;

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://marvera.mx';
      const response = await fetch(`${API_BASE_URL}/api/admin/offers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar oferta');

      await fetchOffers();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar la oferta');
    }
  };

  const toggleFeatured = async (offer: SpecialOffer) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://marvera.mx';
      const response = await fetch(`${API_BASE_URL}/api/admin/offers/${offer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...offer,
          isFeatured: !offer.isFeatured
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar oferta');

      await fetchOffers();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar la oferta');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      originalPrice: '',
      discountPrice: '',
      discountPercent: '',
      imageUrl: '',
      backgroundColor: '#1E3A8A',
      isActive: true,
      isFeatured: false,
      validUntil: '',
      productIds: [],
      maxRedemptions: ''
    });
    setEditingOffer(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3">Cargando ofertas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={fetchOffers}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Ofertas Especiales</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Nueva Oferta
        </button>
      </div>

      {/* Vista previa de ofertas destacadas */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Ofertas Destacadas (Homepage)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.filter(offer => offer.isFeatured && offer.isActive).map((offer) => (
            <div
              key={offer.id}
              className="relative rounded-lg overflow-hidden p-6 text-white"
              style={{ backgroundColor: offer.backgroundColor }}
            >
              <h4 className="text-xl font-bold mb-2">{offer.title}</h4>
              <p className="text-sm mb-4 opacity-90">{offer.description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm opacity-75 line-through">
                    {formatPrice(offer.originalPrice)}
                  </span>
                  <span className="text-2xl font-bold ml-2">
                    {formatPrice(offer.discountPrice)}
                  </span>
                </div>
                <div className="text-xs bg-black bg-opacity-20 px-2 py-1 rounded">
                  -{offer.discountPercent}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabla de todas las ofertas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Oferta
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precios
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vigencia
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {offers.map((offer) => (
              <tr key={offer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{offer.title}</div>
                    <div className="text-sm text-gray-500">{offer.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm text-gray-500 line-through">
                      {formatPrice(offer.originalPrice)}
                    </div>
                    <div className="text-sm font-medium text-primary">
                      {formatPrice(offer.discountPrice)}
                    </div>
                    <div className="text-xs text-green-600">
                      -{offer.discountPercent}% descuento
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      offer.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {offer.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                    {offer.isFeatured && (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Destacada
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div>Desde: {formatDate(offer.validFrom)}</div>
                    {offer.validUntil && (
                      <div>Hasta: {formatDate(offer.validUntil)}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(offer)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleFeatured(offer)}
                      className={`${
                        offer.isFeatured 
                          ? 'text-yellow-600 hover:text-yellow-900' 
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={offer.isFeatured ? 'Quitar de destacadas' : 'Marcar como destacada'}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(offer.id)}
                      className="text-red-600 hover:text-red-900"
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

      {/* Modal para crear/editar oferta */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingOffer ? 'Editar Oferta' : 'Nueva Oferta'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color de Fondo
                    </label>
                    <input
                      type="color"
                      value={formData.backgroundColor}
                      onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Original *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio Descuento *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      % Descuento
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL de Imagen
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Válida Hasta
                    </label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Productos Incluidos
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                    {products.map((product) => (
                      <label key={product.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.productIds.includes(product.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                productIds: [...formData.productIds, product.id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                productIds: formData.productIds.filter(id => id !== product.id)
                              });
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{product.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Activa</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Destacada (Homepage)</span>
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                  >
                    {editingOffer ? 'Actualizar' : 'Crear'} Oferta
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

export default OffersManager;
