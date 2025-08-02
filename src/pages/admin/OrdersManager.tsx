import React from 'react';

const OrdersManager: React.FC = () => {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Pedidos</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-blue-600 text-xl mr-3">📋</div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Gestión de Pedidos</h3>
              <p className="text-blue-600">Sistema de gestión de pedidos en desarrollo</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Pedidos Completados</h3>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Pedidos Pendientes</h3>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div className="text-3xl">⏳</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-400 to-red-600 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Pedidos Cancelados</h3>
                <p className="text-2xl font-bold">-</p>
              </div>
              <div className="text-3xl">❌</div>
            </div>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Funcionalidad en Desarrollo</h2>
          <p className="text-gray-500">El sistema de gestión de pedidos estará disponible próximamente.</p>
        </div>
      </div>
    </div>
  );
};

export default OrdersManager;
