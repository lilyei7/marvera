import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchBranches, createBranch, updateBranch, deleteBranch, type Branch } from '../../store/slices/branchSlice';
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
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
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
      if (editingBranch) {
        await dispatch(updateBranch({ id: editingBranch.id, ...formData }));
        console.log('✅ Sucursal actualizada');
      } else {
        await dispatch(createBranch(formData));
        console.log('✅ Sucursal creada');
      }
      
      handleCloseModal();
      dispatch(fetchBranches()); // Reload branches
    } catch (error) {
      console.error('❌ Error guardando sucursal:', error);
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address || '',
      phone: branch.phone || '',
      latitude: branch.latitude || 0,
      longitude: branch.longitude || 0,
      isActive: branch.isActive,
      openingHours: branch.openingHours || '9:00 AM - 8:00 PM'
    });
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
                  {branch.address && (
                    <div className="flex items-center text-gray-600">
                      <MapPinIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span className="text-sm">{branch.address}</span>
                    </div>
                  )}
                  
                  {branch.phone && (
                    <div className="flex items-center text-gray-600">
                      <PhoneIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span className="text-sm">{branch.phone}</span>
                    </div>
                  )}
                  
                  {branch.openingHours && (
                    <div className="flex items-center text-gray-600">
                      <ClockIcon className="h-5 w-5 mr-2 flex-shrink-0" />
                      <span className="text-sm">{branch.openingHours}</span>
                    </div>
                  )}

                  {!branch.address && !branch.phone && !branch.openingHours && (
                    <div className="text-gray-400 text-sm italic">
                      Información de contacto no disponible
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      branch.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {branch.isActive ? 'Activa' : 'Inactiva'}
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
