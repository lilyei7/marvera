import React, { useState, useRef } from 'react';
import { XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  initialData?: any;
  isEdit?: boolean;
}

interface ProductImage {
  id?: number;
  file?: File;
  url?: string;
  previewUrl: string;
  type: 'file' | 'url';
  error?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  categories,
  onSubmit,
  onCancel,
  initialData,
  isEdit = false
}) => {
  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [stock, setStock] = useState(initialData?.stock || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.categoryId || '');
  const [unit, setUnit] = useState(initialData?.unit || 'kg');
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);

  // Image handling
  const [productImages, setProductImages] = useState<ProductImage[]>(() => {
    if (initialData?.images && initialData.images.length > 0) {
      return initialData.images.map((img: string) => ({
        url: img,
        previewUrl: img,
        type: 'url'
      }));
    }
    return [];
  });
  
  // Removed image URL input
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (validationErrors.name) {
      setValidationErrors(prev => ({ ...prev, name: '' }));
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPrice(value);
      if (validationErrors.price) {
        setValidationErrors(prev => ({ ...prev, price: '' }));
      }
    }
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setStock(value);
      if (validationErrors.stock) {
        setValidationErrors(prev => ({ ...prev, stock: '' }));
      }
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    if (validationErrors.category) {
      setValidationErrors(prev => ({ ...prev, category: '' }));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newImages: ProductImage[] = [...productImages];
    
    for (let i = 0; i < files.length; i++) {
      if (newImages.length >= 5) break;
      
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert(`El archivo ${file.name} excede el límite de 5MB`);
        continue;
      }
      
      const previewUrl = URL.createObjectURL(file);
      newImages.push({
        file,
        previewUrl,
        type: 'file'
      });
    }
    
    setProductImages(newImages);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  // Removed URL and emoji image handling
  
  const handleRemoveImage = (index: number) => {
    const newImages = [...productImages];
    
    // If it's a file, revoke the object URL to prevent memory leaks
    if (newImages[index].type === 'file' && newImages[index].previewUrl) {
      URL.revokeObjectURL(newImages[index].previewUrl);
    }
    
    newImages.splice(index, 1);
    setProductImages(newImages);
  };
  
  const handleMoveImage = (index: number, direction: 'left' | 'right') => {
    if ((direction === 'left' && index === 0) || 
        (direction === 'right' && index === productImages.length - 1)) {
      return;
    }
    
    const newImages = [...productImages];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    
    [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
    setProductImages(newImages);
  };
  
  const handleImageError = (index: number) => {
    const newImages = [...productImages];
    newImages[index] = { ...newImages[index], error: true };
    setProductImages(newImages);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!name.trim()) errors.name = 'El nombre es requerido';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      errors.price = 'El precio debe ser un número mayor a 0';
    }
    if (!stock || isNaN(Number(stock)) || Number(stock) < 0) {
      errors.stock = 'El stock debe ser un número mayor o igual a 0';
    }
    if (!category) errors.category = 'Selecciona una categoría';
    
    // At least one image required
    if (productImages.length === 0) {
      errors.images = 'Debes agregar al menos una imagen';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    setIsSubmitting(true);
    
    try {
      // Create FormData to send files and data
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('stock', stock);
      formData.append('description', description || '');
      formData.append('categoryId', category);
      formData.append('unit', unit);
      formData.append('isFeatured', isFeatured ? '1' : '0');
      
      // Add images - only from files now
      productImages.forEach(img => {
        if (img.file) {
          formData.append('images', img.file);
        }
      });
      
      // If editing, add the ID
      if (isEdit && initialData?.id) {
        formData.append('id', initialData.id);
      }
      
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error al guardar el producto. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-bounce-gentle">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-primary">
          {isEdit ? 'Editar Producto' : 'Agregar Producto'}
        </h3>
        <button 
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 text-2xl hover:scale-110 transition-all duration-200"
        >
          &times;
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Producto
            </label>
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              placeholder="Ej: Salmón Atlántico Premium"
              required
            />
            {validationErrors.name && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.name}</p>
            )}
          </div>
          
          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={handlePriceChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              placeholder="0.00"
              required
            />
            {validationErrors.price && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.price}</p>
            )}
          </div>
          
          {/* Stock */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock
            </label>
            <input
              type="number"
              value={stock}
              onChange={handleStockChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              placeholder="100"
              required
            />
            {validationErrors.stock && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.stock}</p>
            )}
          </div>
          
          {/* Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unidad
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
            >
              <option value="kg">Kilogramo</option>
              <option value="lb">Libra</option>
              <option value="unidad">Unidad</option>
              <option value="docena">Docena</option>
            </select>
          </div>
          
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={category}
              onChange={handleCategoryChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
              required
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {validationErrors.category && (
              <p className="text-red-500 text-xs mt-1">{validationErrors.category}</p>
            )}
          </div>
        </div>
        
        {/* Images */}
        <div>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Imágenes del Producto</h3>
              <p className="text-xs text-gray-500">
                Agrega hasta 5 imágenes para mostrar tu producto (máximo 5MB por imagen)
              </p>
            </div>
            
            {/* Image Previews */}
            <div className="flex flex-wrap gap-3">
              {productImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center overflow-hidden">
                      <>
                        <img
                          src={image.previewUrl}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(index)}
                          style={{ display: image.error ? 'none' : 'block' }}
                        />
                        <div 
                          className="w-full h-full bg-red-50 items-center justify-center text-red-400 text-xs"
                          style={{ display: image.error ? 'flex' : 'none' }}
                        >
                          Error
                        </div>
                      </>
                  </div>
                  
                  {/* Delete button */}
                  <div className="absolute -top-2 -right-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Move buttons */}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMoveImage(index, 'left')}
                        className="w-5 h-5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        ←
                      </button>
                    )}
                    {index < productImages.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMoveImage(index, 'right')}
                        className="w-5 h-5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Image upload options */}
            <div className="space-y-4">
              {/* File upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                  multiple
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center py-3 px-4 text-sm text-gray-600 hover:text-marina-600 hover:border-marina-300 transition-colors"
                  disabled={productImages.length >= 5}
                >
                  <CloudArrowUpIcon className="w-8 h-8 mb-2" />
                  Subir imágenes desde tu dispositivo
                  <span className="text-xs text-gray-400 mt-1">JPG, PNG, GIF hasta 5MB</span>
                </button>
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              {productImages.length} de 5 imágenes agregadas
            </div>
            
            {validationErrors.images && (
              <p className="text-red-500 text-xs">{validationErrors.images}</p>
            )}
          </div>
        </div>
        
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300"
            placeholder="Descripción detallada del producto..."
          />
        </div>
        
        {/* Featured checkbox */}
        <div className="flex items-center">
          <input
            id="featured"
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
            Producto destacado
          </label>
        </div>
        
        {/* Submit and Cancel buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-1"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                Guardando...
              </>
            ) : (
              <>Guardar</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
