import React, { useState, useEffect } from 'react';
import { useResponsive, responsiveClasses } from '../hooks/useResponsive';
import { ResponsiveGrid, ResponsiveText } from '../components/responsive/ResponsiveComponents';
import ResponsiveProductCard from '../components/responsive/ResponsiveProductCard';
import ResponsiveNavigation from '../components/responsive/ResponsiveNavigation';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  inStock: boolean;
  unit?: string;
}

const ResponsiveProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const { 
    isMobile, 
    shouldUseCompactLayout, 
    productsPerRow
  } = useResponsive();

  // Simulación de carga de productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://marvera.mx/api/products');
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filtrado responsivo de productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  // Navegación responsiva
  const navigationItems = [
    { name: 'Inicio', href: '/' },
    { name: 'Productos', href: '/productos' },
    { name: 'Sucursales', href: '/sucursales' },
    { name: 'Mayoreo', href: '/mayoreo' },
  ];

  const navActions = (
    <>
      <button className="p-2 text-gray-600 hover:text-primary transition-colors">
        <ShoppingCartIcon className="h-6 w-6" />
      </button>
      {!isMobile && (
        <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Iniciar Sesión
        </button>
      )}
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ResponsiveNavigation
          logo={<div className="text-xl font-bold text-primary">MarVera</div>}
          navigationItems={navigationItems}
          actions={navActions}
        />
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <ResponsiveText variant="body" className="text-gray-600">
              Cargando productos...
            </ResponsiveText>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navegación Responsiva */}
      <ResponsiveNavigation
        logo={<div className="text-xl font-bold text-primary">MarVera</div>}
        navigationItems={navigationItems}
        actions={navActions}
      />

      {/* Contenido Principal */}
      <div className={responsiveClasses.container}>
        <div className={responsiveClasses.sectionPadding}>
          
          {/* Header */}
          <div className="mb-8">
            <ResponsiveText 
              variant="h1" 
              align="center"
              className="text-gray-900 mb-4"
            >
              Productos Frescos del Mar
            </ResponsiveText>
            <ResponsiveText 
              variant="body" 
              align="center"
              className="text-gray-600 max-w-2xl mx-auto"
            >
              Descubre nuestra selección de mariscos y pescados frescos, 
              directamente desde el mar hasta tu mesa.
            </ResponsiveText>
          </div>

          {/* Filtros Responsivos */}
          <div className={`mb-8 ${shouldUseCompactLayout ? 'space-y-4' : 'flex items-center justify-between'}`}>
            
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  isMobile ? 'text-base' : 'text-sm'
                }`}
              />
            </div>

            {/* Filtros de Categoría */}
            <div className={`${shouldUseCompactLayout ? 'w-full' : 'ml-4'}`}>
              {shouldUseCompactLayout ? (
                // Mobile: Select dropdown
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'Todas las categorías' : category}
                    </option>
                  ))}
                </select>
              ) : (
                // Desktop: Filter buttons
                <div className="flex items-center space-x-2">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
                  <div className="flex space-x-2">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedCategory === category
                            ? 'bg-primary text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {category === 'all' ? 'Todos' : category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Grid de Productos */}
          {filteredProducts.length > 0 ? (
            <ResponsiveGrid
              cols={{
                mobile: 1,
                tablet: 2,
                desktop: 3,
                largeDesktop: 4
              }}
              gap="md"
              className="mb-8"
            >
              {filteredProducts.map((product, index) => (
                <ResponsiveProductCard
                  key={product.id}
                  product={{
                    ...product,
                    category: product.category as any, // Cast temporal para evitar error de tipo
                    unit: product.unit || 'unidad' // Asegurar que unit no sea undefined
                  }}
                  priority={index < productsPerRow} // Prioridad para primera fila
                  onClick={() => console.log('Ver producto:', product.id)}
                />
              ))}
            </ResponsiveGrid>
          ) : (
            // Sin productos
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 bg-gray-400 rounded opacity-50"></div>
              </div>
              <ResponsiveText variant="h3" align="center" className="text-gray-900 mb-2">
                No se encontraron productos
              </ResponsiveText>
              <ResponsiveText variant="body" align="center" className="text-gray-600">
                Intenta cambiar los filtros o buscar algo diferente
              </ResponsiveText>
            </div>
          )}

          {/* Información adicional */}
          <div className="text-center py-8 border-t border-gray-200">
            <ResponsiveText variant="body" className="text-gray-600">
              Mostrando {filteredProducts.length} de {products.length} productos
            </ResponsiveText>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveProductsPage;
