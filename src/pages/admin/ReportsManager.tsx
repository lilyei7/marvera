import React from 'react';

const ReportsManager: React.FC = () => {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Reportes y Analíticas</h1>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-purple-600 text-xl mr-3">📊</div>
            <div>
              <h3 className="text-lg font-semibold text-purple-800">Centro de Reportes</h3>
              <p className="text-purple-600">Analíticas y reportes de ventas en desarrollo</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Ventas del Día</h3>
                <p className="text-2xl font-bold">$-</p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Ventas del Mes</h3>
                <p className="text-2xl font-bold">$-</p>
              </div>
              <div className="text-2xl">📈</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Productos Vendidos</h3>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div className="text-2xl">📦</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-400 to-red-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Clientes Activos</h3>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div className="text-2xl">👥</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Productos Más Vendidos</h3>
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-gray-500">Gráfico en desarrollo</p>
            </div>
          </div>
          
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tendencias de Ventas</h3>
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📈</div>
              <p className="text-gray-500">Gráfico en desarrollo</p>
            </div>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Sistema de Reportes en Desarrollo</h2>
          <p className="text-gray-500">Las analíticas detalladas y reportes avanzados estarán disponibles próximamente.</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsManager;
