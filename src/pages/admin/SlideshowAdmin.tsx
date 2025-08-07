import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, PhotoIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

import { getApiUrl } from '../../config/api';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  imageUrl?: string;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface SlideFormData {
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  order: number;
  image: File | null;
}

const SlideshowAdmin: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<SlideFormData>({
    title: '',
    subtitle: '',
    description: '',
    buttonText: '',
    buttonLink: '',
    backgroundColor: '#1E3A8A',
    textColor: '#FFFFFF',
    isActive: true,
    order: 0,
    image: null
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await fetch(getApiUrl('/api/slideshow/all'));
      if (response.ok) {
        const data = await response.json();
        setSlides(data);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('buttonText', formData.buttonText);
      formDataToSend.append('buttonLink', formData.buttonLink);
      formDataToSend.append('backgroundColor', formData.backgroundColor);
      formDataToSend.append('textColor', formData.textColor);
      formDataToSend.append('isActive', formData.isActive.toString());
      formDataToSend.append('order', formData.order.toString());
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const url = editingSlide
        ? getApiUrl(`/api/slideshow/${editingSlide.id}`)
        : getApiUrl('/api/slideshow');      const method = editingSlide ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      if (response.ok) {
        await fetchSlides();
        resetForm();
        setIsModalOpen(false);
      } else {
        alert('Error al guardar el slide');
      }
    } catch (error) {
      console.error('Error saving slide:', error);
      alert('Error al guardar el slide');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (slide: Slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle || '',
      description: slide.description || '',
      buttonText: slide.buttonText || '',
      buttonLink: slide.buttonLink || '',
      backgroundColor: slide.backgroundColor,
      textColor: slide.textColor,
      isActive: slide.isActive,
      order: slide.order,
      image: null
    });
    if (slide.imageUrl) {
      setImagePreview(`${getApiUrl('')}${slide.imageUrl}`);
    } else {
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este slide?')) return;

    try {
      const response = await fetch(getApiUrl(`/api/slideshow/${id}`), {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchSlides();
      } else {
        alert('Error al eliminar el slide');
      }
    } catch (error) {
      console.error('Error deleting slide:', error);
      alert('Error al eliminar el slide');
    }
  };

  const toggleActive = async (id: number) => {
    try {
      const response = await fetch(`https://marvera.mx/api/slideshow/${id}/toggle`, {
        method: 'PUT'
      });

      if (response.ok) {
        await fetchSlides();
      } else {
        alert('Error al cambiar estado del slide');
      }
    } catch (error) {
      console.error('Error toggling slide:', error);
      alert('Error al cambiar estado del slide');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      buttonText: '',
      buttonLink: '',
      backgroundColor: '#1E3A8A',
      textColor: '#FFFFFF',
      isActive: true,
      order: 0,
      image: null
    });
    setImagePreview(null);
    setEditingSlide(null);
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Slideshow</h1>
        <button
          onClick={openModal}
          className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Agregar Slide</span>
        </button>
      </div>

      {/* Lista de slides */}
      <div className="grid gap-6">
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden"
          >
            <div className="flex">
              {/* Preview del slide */}
              <div 
                className="w-1/3 h-48 flex items-center justify-center text-white relative"
                style={{ backgroundColor: slide.backgroundColor }}
              >
                {slide.imageUrl ? (
                  <div className="absolute inset-0">
                    <img
                      src={`https://marvera.mx${slide.imageUrl}`}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <div 
                      className="absolute inset-0 bg-opacity-50"
                      style={{ backgroundColor: slide.backgroundColor }}
                    ></div>
                  </div>
                ) : (
                  <PhotoIcon className="h-16 w-16 text-white opacity-50" />
                )}
                <div className="relative z-10 text-center p-4">
                  <h3 className="font-bold text-lg" style={{ color: slide.textColor }}>
                    {slide.title}
                  </h3>
                  {slide.subtitle && (
                    <p className="text-sm opacity-90" style={{ color: slide.textColor }}>
                      {slide.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Información del slide */}
              <div className="flex-1 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{slide.title}</h3>
                    {slide.subtitle && (
                      <p className="text-gray-600">{slide.subtitle}</p>
                    )}
                    {slide.description && (
                      <p className="text-gray-500 text-sm mt-2">{slide.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      slide.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {slide.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className="text-sm text-gray-500">Orden: {slide.order}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    <div className="text-sm text-gray-500">
                      <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: slide.backgroundColor }}></span>
                      <span className="ml-1">Fondo</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: slide.textColor }}></span>
                      <span className="ml-1">Texto</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleActive(slide.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        slide.isActive 
                          ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                      title={slide.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {slide.isActive ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={() => handleEdit(slide)}
                      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                      title="Editar"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {slides.length === 0 && (
          <div className="text-center py-12">
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay slides</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza creando tu primer slide para el slideshow.
            </p>
            <div className="mt-6">
              <button
                onClick={openModal}
                className="bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg"
              >
                Agregar Slide
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal para crear/editar slide */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingSlide ? 'Editar Slide' : 'Crear Nuevo Slide'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Cerrar</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Información básica */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtítulo
                    </label>
                    <input
                      type="text"
                      name="subtitle"
                      value={formData.subtitle}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Texto del Botón
                    </label>
                    <input
                      type="text"
                      name="buttonText"
                      value={formData.buttonText}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enlace del Botón
                    </label>
                    <input
                      type="url"
                      name="buttonLink"
                      value={formData.buttonLink}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Configuración visual */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color de Fondo
                    </label>
                    <input
                      type="color"
                      name="backgroundColor"
                      value={formData.backgroundColor}
                      onChange={handleInputChange}
                      className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color del Texto
                    </label>
                    <input
                      type="color"
                      name="textColor"
                      value={formData.textColor}
                      onChange={handleInputChange}
                      className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orden
                    </label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Slide activo
                    </label>
                  </div>
                </div>

                {/* Subida de imagen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagen de Fondo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* Preview del slide */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Vista Previa</h3>
                  <div 
                    className="w-full h-48 rounded-lg flex items-center justify-center text-white relative overflow-hidden"
                    style={{ backgroundColor: formData.backgroundColor }}
                  >
                    {imagePreview && (
                      <div className="absolute inset-0">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div 
                          className="absolute inset-0 bg-opacity-50"
                          style={{ backgroundColor: formData.backgroundColor }}
                        ></div>
                      </div>
                    )}
                    <div className="relative z-10 text-center p-4">
                      <h3 className="font-bold text-xl mb-2" style={{ color: formData.textColor }}>
                        {formData.title || 'Título del Slide'}
                      </h3>
                      {formData.subtitle && (
                        <p className="text-lg opacity-90 mb-2" style={{ color: formData.textColor }}>
                          {formData.subtitle}
                        </p>
                      )}
                      {formData.description && (
                        <p className="text-sm opacity-80 mb-4" style={{ color: formData.textColor }}>
                          {formData.description}
                        </p>
                      )}
                      {formData.buttonText && (
                        <button
                          type="button"
                          className="px-6 py-2 bg-white bg-opacity-20 rounded-lg backdrop-blur-sm border border-white border-opacity-30"
                          style={{ color: formData.textColor }}
                        >
                          {formData.buttonText}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Guardando...' : (editingSlide ? 'Actualizar' : 'Crear')}
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

export default SlideshowAdmin;
