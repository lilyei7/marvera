import React, { useEffect, useState } from 'react';

const ApiDebugger: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<{
    products: 'loading' | 'success' | 'error';
    featuredProducts: 'loading' | 'success' | 'error';
    productsData: any[];
    featuredData: any[];
    errors: string[];
  }>({
    products: 'loading',
    featuredProducts: 'loading',
    productsData: [],
    featuredData: [],
    errors: []
  });

  useEffect(() => {
    testApiConnections();
  }, []);

  const testApiConnections = async () => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://marvera.mx';
    const errors: string[] = [];

    // Test products endpoint
    try {
      console.log('🔍 Probando conexión a:', `${API_BASE_URL}/api/products`);
      const productsResponse = await fetch(`${API_BASE_URL}/api/products`);
      
      if (!productsResponse.ok) {
        throw new Error(`HTTP ${productsResponse.status}: ${productsResponse.statusText}`);
      }
      
      const productsData = await productsResponse.json();
      console.log('✅ Productos obtenidos:', productsData);
      
      setApiStatus(prev => ({
        ...prev,
        products: 'success',
        productsData: productsData.products || []
      }));
    } catch (error) {
      const errorMsg = `Productos: API no disponible`;
      errors.push(errorMsg);
      setApiStatus(prev => ({ ...prev, products: 'error' }));
    }

    // Test featured products endpoint - sin logging de errores ya que sabemos que no existe
    try {
      const featuredResponse = await fetch(`${API_BASE_URL}/api/featured-products`);
      
      if (!featuredResponse.ok) {
        throw new Error(`HTTP ${featuredResponse.status}: ${featuredResponse.statusText}`);
      }
      
      const featuredData = await featuredResponse.json();
      console.log('✅ Productos destacados obtenidos:', featuredData);
      
      setApiStatus(prev => ({
        ...prev,
        featuredProducts: 'success',
        featuredData: featuredData || []
      }));
    } catch (error) {
      // No mostrar error porque usamos fallback automático
      setApiStatus(prev => ({ ...prev, featuredProducts: 'error' }));
    }

    setApiStatus(prev => ({ ...prev, errors }));
  };

  const getStatusIcon = (status: 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading': return '🔄';
      case 'success': return '✅';
      case 'error': return '❌';
    }
  };

  const getStatusColor = (status: 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading': return 'text-yellow-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-2xl rounded-lg p-4 border border-gray-200 z-50 max-w-md">
      <h3 className="font-bold text-gray-900 mb-3">🔍 Debug API MarVera</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span>API Base URL:</span>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
            {import.meta.env.VITE_API_URL || 'https://marvera.mx'}
          </code>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Productos:</span>
          <span className={`flex items-center ${getStatusColor(apiStatus.products)}`}>
            {getStatusIcon(apiStatus.products)} 
            {apiStatus.products === 'success' && ` (${apiStatus.productsData.length})`}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span>Destacados:</span>
          <span className={`flex items-center ${getStatusColor(apiStatus.featuredProducts)}`}>
            {getStatusIcon(apiStatus.featuredProducts)}
            {apiStatus.featuredProducts === 'success' && ` (${apiStatus.featuredData.length})`}
          </span>
        </div>
        
        {apiStatus.errors.length > 0 && (
          <div className="mt-3 p-2 bg-red-50 rounded text-xs">
            <div className="font-semibold text-red-800 mb-1">Errores:</div>
            {apiStatus.errors.map((error, index) => (
              <div key={index} className="text-red-600">{error}</div>
            ))}
          </div>
        )}
        
        <button 
          onClick={testApiConnections}
          className="mt-3 w-full bg-primary text-white text-xs py-2 px-3 rounded hover:bg-primary-dark transition-colors"
        >
          🔄 Probar Conexión
        </button>
      </div>
    </div>
  );
};

export default ApiDebugger;

