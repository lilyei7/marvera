import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  emoji: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    emoji: '',
    description: '',
    isActive: true
  });

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5173';

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      if (!response.ok) throw new Error('Error al cargar categorías');
      
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setCategories([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        // Editar categoría existente
        const response = await fetch(`${API_BASE_URL}/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Error al actualizar categoría');
      } else {
        // Crear nueva categoría
        const response = await fetch(`${API_BASE_URL}/api/categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Error al crear categoría');
      }

      await fetchCategories();
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error:', error);
      // Para desarrollo, actualizar localmente
      if (editingCategory) {
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, ...formData }
            : cat
        ));
      } else {
        const newCategory: Category = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString()
        };
        setCategories([...categories, newCategory]);
      }
      resetForm();
      setIsModalOpen(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      emoji: category.emoji,
      description: category.description || '',
      isActive: category.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta categoría?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Error al eliminar categoría');

      await fetchCategories();
    } catch (error) {
      console.error('Error:', error);
      // Para desarrollo, eliminar localmente
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  const toggleActive = async (category: Category) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...category,
          isActive: !category.isActive
        }),
      });

      if (!response.ok) throw new Error('Error al actualizar categoría');

      await fetchCategories();
    } catch (error) {
      console.error('Error:', error);
      // Para desarrollo, actualizar localmente
      setCategories(categories.map(cat => 
        cat.id === category.id 
          ? { ...cat, isActive: !cat.isActive }
          : cat
      ));
    }
  };

  const resetForm = () => {
    setFormData({ name: '', emoji: '', description: '', isActive: true });
    setEditingCategory(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Categorías</h2>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Nueva Categoría
        </button>
      </div>

      {/* Grid de Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Header con Emoji */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 text-center">
              <div className="text-4xl mb-2">{category.emoji}</div>
              <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4 h-12 overflow-hidden">
                {category.description || 'Sin descripción'}
              </p>
              
              {/* Status */}
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  category.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {category.isActive ? 'Activa' : 'Inactiva'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(category.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                >
                  <PencilIcon className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(category)}
                  className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                    category.isActive
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {category.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors flex items-center justify-center"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">No hay categorías registradas</div>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Categoría
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Ej. Pescados Frescos"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emoji
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.emoji}
                    onChange={(e) => setFormData({...formData, emoji: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-center text-2xl"
                    placeholder="🐟"
                    maxLength={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">Usa un emoji que represente la categoría</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="Descripción de la categoría..."
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Categoría activa</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    {editingCategory ? 'Actualizar' : 'Crear'} Categoría
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

export default CategoryManager;
