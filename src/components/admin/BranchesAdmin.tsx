import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchBranches, updateBranch, deleteBranch, type Branch } from '../../store/slices/branchSlice';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface BranchFormData {
  name: string;
  address?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  openingHours?: string;
}

const BranchesAdmin: React.FC = () => {
  const dispatch = useAppDispatch();
  const { branches, loading, error } = useAppSelector((state) => state.branches);
  
  // Debug logs
  console.log('🔍 [BranchesAdmin] Current state:', { 
    branchesCount: branches.length, 
    loading, 
    error,
    branchesData: branches 
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    address: '',
    phone: '',
    latitude: 0,
    longitude: 0,
    isActive: true,
    openingHours: '9:00 AM - 8:00 PM'
  });

  useEffect(() => {
    console.log('🔄 Cargando sucursales desde la base de datos...');
    dispatch(fetchBranches());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append('name', formData.name);
      if (formData.address) formDataToSend.append('address', formData.address);
      if (formData.phone) formDataToSend.append('phone', formData.phone);
      if (formData.latitude) formDataToSend.append('latitude', formData.latitude.toString());
      if (formData.longitude) formDataToSend.append('longitude', formData.longitude.toString());
      formDataToSend.append('isActive', formData.isActive.toString());
      if (formData.openingHours) formDataToSend.append('openingHours', formData.openingHours);
      
      // Add image file if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      
      if (editingBranch) {
        // For updates, we'll need to handle this differently since Redux might not support FormData
        await dispatch(updateBranch({ id: editingBranch.id, ...formData }));
        console.log('✅ Sucursal actualizada');
      } else {
        // For new branches, create using FormData directly with API call
        const response = await fetch('https://marvera.mx/api/branches', {
          method: 'POST',
          body: formDataToSend,
        });
        
        if (response.ok) {
          console.log('✅ Sucursal creada con imagen');
        } else {
          throw new Error('Error creating branch with image');
        }
      }
      
      handleCloseModal();
      dispatch(fetchBranches()); // Reload branches
    } catch (error) {
      console.error('❌ Error guardando sucursal:', error);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 5MB permitido');
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('branch-image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address || '',
      phone: branch.phone || '',
      latitude: branch.coordinates?.lat || branch.latitude || 0,
      longitude: branch.coordinates?.lng || branch.longitude || 0,
      isActive: branch.isActive ?? true,
      openingHours: branch.openingHours || (branch.operatingHours?.monday ? 
        `${branch.operatingHours.monday.open} - ${branch.operatingHours.monday.close}` : 
        '9:00 AM - 8:00 PM')
    });
    
    // Set existing image preview if available
    if (branch.imageUrl) {
      setImagePreview(branch.imageUrl);
    } else {
      setImagePreview(null);
    }
    setImageFile(null); // Reset file input for editing
    
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta sucursal?')) {
      try {
        await dispatch(deleteBranch(id));
        console.log('✅ Sucursal eliminada');
        dispatch(fetchBranches()); // Reload branches
      } catch (error) {
        console.error('❌ Error eliminando sucursal:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBranch(null);
    setImageFile(null);
    setImagePreview(null);
    setFormData({
      name: '',
      address: '',
      phone: '',
      latitude: 0,
      longitude: 0,
      isActive: true,
      openingHours: '9:00 AM - 8:00 PM'
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  return (
    <AdminLayout 
      title="Gestión de Sucursales"
      subtitle={`Administra las sucursales de MarVera${branches.length > 0 ? ` (${branches.length} sucursal${branches.length !== 1 ? 'es' : ''})` : ''}`}
    >
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div></div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="h-5 w-5" />
            Nueva Sucursal
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-gray-600">Cargando sucursales...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => dispatch(fetchBranches())}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Branches Grid */}
      {!loading && branches.length === 0 ? (
        <div className="text-center py-12">
          <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay sucursales</h3>
          <p className="text-gray-600 mb-6">Comienza agregando tu primera sucursal</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg"
          >
            Crear Primera Sucursal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch: Branch) => (
            <div key={branch.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              {/* Branch Image */}
              {branch.imageUrl && (
                <div className="h-48 w-full overflow-hidden">
                  <img 
                    src={branch.imageUrl} 
                    alt={branch.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Hide image if it fails to load
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{branch.name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(branch)}
                      className="text-primary hover:text-primary-dark p-1"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(branch.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {(branch.address || branch.city) && (
                    <div className="flex items-center text-gray-600">
                      <MapPinIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span className="text-sm">
                        {branch.address ? branch.address : 
                         branch.city ? `${branch.city}${branch.state ? `, ${branch.state}` : ''}` : 'Sin dirección'}
                      </span>
                    </div>
                  )}
                  
                  {branch.phone && (
                    <div className="flex items-center text-gray-600">
                      <PhoneIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span className="text-sm">{branch.phone}</span>
                    </div>
                  )}
                  
                  {(branch.openingHours || (branch.operatingHours?.monday)) && (
                    <div className="flex items-center text-gray-600">
                      <ClockIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span className="text-sm">
                        {branch.openingHours || 
                         (branch.operatingHours?.monday ? 
                          `${branch.operatingHours.monday.open} - ${branch.operatingHours.monday.close}` : 
                          'Horario no disponible')}
                      </span>
                    </div>
                  )}

                  {branch.email && (
                    <div className="flex items-center text-gray-600">
                      <span className="text-sm">📧 {branch.email}</span>
                    </div>
                  )}

                  {branch.manager && (
                    <div className="flex items-center text-gray-600">
                      <span className="text-sm">👤 {branch.manager}</span>
                    </div>
                  )}

                  {!branch.address && !branch.city && !branch.phone && !branch.openingHours && !branch.operatingHours && (
                    <div className="text-gray-400 text-sm italic">
                      Información de contacto no disponible
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      (branch.isActive ?? true) 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {(branch.isActive ?? true) ? 'Activa' : 'Inactiva'}
                    </span>
                    <div className="text-xs text-gray-500">
                      ID: {branch.id}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingBranch ? 'Editar Sucursal' : 'Nueva Sucursal'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Sucursal
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ej: MarVera Centro"
                  />
                </div>

                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen de la Sucursal <span className="text-gray-400">(opcional)</span>
                  </label>
                  
                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mb-3 relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  {/* File Input */}
                  <input
                    type="file"
                    id="branch-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección <span className="text-gray-400">(opcional)</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Dirección completa de la sucursal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono <span className="text-gray-400">(opcional)</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ej: +52 55 1234 5678"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitud <span className="text-gray-400">(opcional)</span>
                    </label>
                    <input
                      type="number"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="19.4326"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitud <span className="text-gray-400">(opcional)</span>
                    </label>
                    <input
                      type="number"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="-99.1332"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horarios <span className="text-gray-400">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    name="openingHours"
                    value={formData.openingHours}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ej: 9:00 AM - 8:00 PM"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Sucursal activa
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                  >
                    {editingBranch ? 'Actualizar' : 'Crear'} Sucursal
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

export default BranchesAdmin;
