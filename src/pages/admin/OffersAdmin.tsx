import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, SparklesIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../../layouts/AdminLayout';
import { getApiUrl, API_CONFIG } from '../../config/api';

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
  validUntil?: string;
  productIds?: string;
  maxRedemptions?: number;
  createdAt: string;
  updatedAt: string;
}

interface OfferFormData {
  title: string;
  description: string;
  originalPrice: string;
  discountPrice: string;
  discountPercent: string;
  imageUrl: string;
  imageFile: File | null;
  backgroundColor: string;
  isActive: boolean;
  isFeatured: boolean;
  validUntil: string;
  maxRedemptions: string;
}

const OffersAdmin: React.FC = () => {
  const [offers, setOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<OfferFormData>({
    title: '',
    description: '',
    originalPrice: '',
    discountPrice: '',
    discountPercent: '',
    imageUrl: '',
    imageFile: null,
    backgroundColor: '#1E3A8A',
    isActive: true,
    isFeatured: false,
    validUntil: '',
    maxRedemptions: ''
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_OFFERS), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOffers(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOffer = async () => {
    setSaving(true);
    try {
      let finalImageUrl = formData.imageUrl;

      // Si hay un archivo de imagen, subirlo primero
      if (formData.imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append('image', formData.imageFile);

        const uploadResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_OFFERS_UPLOAD), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: uploadFormData
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          finalImageUrl = uploadResult.imageUrl;
        } else {
          alert('Error al subir la imagen');
          setSaving(false);
          return;
        }
      }

      // Calcular descuento automáticamente si no se proporciona
      let discountPercent = formData.discountPercent;
      if (!discountPercent && formData.originalPrice && formData.discountPrice) {
        const original = parseFloat(formData.originalPrice);
        const discount = parseFloat(formData.discountPrice);
        discountPercent = Math.round(((original - discount) / original) * 100).toString();
      }

      const offerData = {
        ...formData,
        imageUrl: finalImageUrl,
        discountPercent: discountPercent || null,
        originalPrice: parseFloat(formData.originalPrice),
        discountPrice: parseFloat(formData.discountPrice),
        maxRedemptions: formData.maxRedemptions ? parseInt(formData.maxRedemptions) : null,
        validUntil: formData.validUntil || null
      };

      // Remover imageFile del objeto que se envía
      const { imageFile, ...dataToSend } = offerData;

      const url = editingOffer 
        ? getApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN_OFFERS}/${editingOffer.id}`)
        : getApiUrl(API_CONFIG.ENDPOINTS.ADMIN_OFFERS);
      
      const method = editingOffer ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        await fetchOffers();
        closeModal();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || 'No se pudo guardar la oferta'}`);
      }
    } catch (error) {
      console.error('Error saving offer:', error);
      alert('Error interno del servidor');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOffer = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta oferta?')) {
      try {
        const response = await fetch(getApiUrl(`${API_CONFIG.ENDPOINTS.ADMIN_OFFERS}/${id}`), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          await fetchOffers();
        }
      } catch (error) {
        console.error('Error deleting offer:', error);
      }
    }
  };

  const openModal = (offer?: SpecialOffer) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        title: offer.title,
        description: offer.description,
        originalPrice: offer.originalPrice.toString(),
        discountPrice: offer.discountPrice.toString(),
        discountPercent: offer.discountPercent?.toString() || '',
        imageUrl: offer.imageUrl || '',
        imageFile: null,
        backgroundColor: offer.backgroundColor,
        isActive: offer.isActive,
        isFeatured: offer.isFeatured,
        validUntil: offer.validUntil ? offer.validUntil.split('T')[0] : '',
        maxRedemptions: offer.maxRedemptions?.toString() || ''
      });
    } else {
      setEditingOffer(null);
      setFormData({
        title: '',
        description: '',
        originalPrice: '',
        discountPrice: '',
        discountPercent: '',
        imageUrl: '',
        imageFile: null,
        backgroundColor: '#1E3A8A',
        isActive: true,
        isFeatured: false,
        validUntil: '',
        maxRedemptions: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOffer(null);
    setImagePreview(null);
    setFormData({
      title: '',
      description: '',
      originalPrice: '',
      discountPrice: '',
      discountPercent: '',
      imageUrl: '',
      imageFile: null,
      backgroundColor: '#1E3A8A',
      isActive: true,
      isFeatured: false,
      validUntil: '',
      maxRedemptions: ''
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Gestión de Ofertas" subtitle="Administra las ofertas especiales">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gestión de Ofertas" subtitle="Administra las ofertas especiales">
      {/* Header con botón de crear */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <SparklesIcon className="h-6 w-6 text-primary" />
          <span className="text-lg font-medium text-gray-900">
            {offers.length} ofertas especiales
          </span>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary/90 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Nueva Oferta</span>
        </button>
      </div>

      {/* Lista de ofertas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
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
                  Válida hasta
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                        style={{ backgroundColor: offer.backgroundColor }}
                      >
                        <SparklesIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {offer.title}
                        </div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {offer.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <span className="line-through text-gray-500">${offer.originalPrice}</span>
                      <span className="ml-2 font-medium text-green-600">${offer.discountPrice}</span>
                    </div>
                    {offer.discountPercent && (
                      <div className="text-xs text-red-500">
                        {offer.discountPercent}% descuento
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        offer.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {offer.isActive ? 'Activa' : 'Inactiva'}
                      </span>
                      {offer.isFeatured && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Destacada
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {offer.validUntil 
                      ? new Date(offer.validUntil).toLocaleDateString()
                      : 'Sin límite'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openModal(offer)}
                        className="text-primary hover:text-primary/80 p-1"
                        title="Editar"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="text-red-600 hover:text-red-800 p-1"
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
        
        {offers.length === 0 && (
          <div className="text-center py-12">
            <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay ofertas</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando tu primera oferta especial.
            </p>
            <div className="mt-6">
              <button
                onClick={() => openModal()}
                className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary/90 transition-colors mx-auto"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Nueva Oferta</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de crear/editar oferta */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl bg-white rounded-lg shadow-lg">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingOffer ? 'Editar Oferta' : 'Nueva Oferta'}
              </h3>
            </div>
            
            <div className="space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Título de la oferta"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                  placeholder="Descripción de la oferta"
                />
              </div>

              {/* Precios */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio Original</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio con Descuento</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">% Descuento (opcional)</label>
                  <input
                    type="number"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Auto"
                  />
                </div>
              </div>

              {/* Subida de imagen y color */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Imagen de la Oferta</label>
                  
                  {/* Vista previa de imagen actual o nueva */}
                  {(imagePreview || formData.imageUrl) && (
                    <div className="mt-2 mb-4">
                      <img 
                        src={imagePreview || formData.imageUrl} 
                        alt="Vista previa" 
                        className="h-32 w-auto object-cover rounded-lg border border-gray-300"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {imagePreview ? '📷 Nueva imagen seleccionada' : 'Imagen actual'}
                      </p>
                    </div>
                  )}

                  {/* Campo de subida de archivo */}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  
                  {/* Vista previa del archivo seleccionado */}
                  {formData.imageFile && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600">
                        📁 Archivo seleccionado: {formData.imageFile.name}
                      </p>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos aceptados: JPG, PNG, GIF. Tamaño máximo: 5MB
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Color de Fondo</label>
                  <input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 h-10 focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
              </div>

              {/* Fecha límite y máximo de canjes */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Válida hasta (opcional)</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Máximo de canjes (opcional)</label>
                  <input
                    type="number"
                    value={formData.maxRedemptions}
                    onChange={(e) => setFormData({ ...formData, maxRedemptions: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Sin límite"
                  />
                </div>
              </div>

              {/* Estados */}
              <div className="flex space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Oferta activa
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900">
                    Oferta destacada
                  </label>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveOffer}
                disabled={saving}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {formData.imageFile ? 'Subiendo imagen...' : 'Guardando...'}
                  </>
                ) : (
                  `${editingOffer ? 'Actualizar' : 'Crear'} Oferta`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default OffersAdmin;
