import React from 'react';

const SettingsManager: React.FC = () => {
  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Configuración del Sistema</h1>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="text-gray-600 text-xl mr-3">⚙️</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Panel de Configuración</h3>
              <p className="text-gray-600">Gestión de configuraciones del sistema</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🏪</span>
              Configuración de Tienda
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Nombre de la tienda:</span>
                <span className="font-semibold">MarVera</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Dirección:</span>
                <span className="font-semibold">En configuración</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Teléfono:</span>
                <span className="font-semibold">En configuración</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold">admin@marvera.com</span>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">💱</span>
              Configuración de Pagos
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Moneda:</span>
                <span className="font-semibold">MXN (Peso Mexicano)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Métodos de pago:</span>
                <span className="font-semibold">En configuración</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gateway de pago:</span>
                <span className="font-semibold">En configuración</span>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🚚</span>
              Configuración de Envíos
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Zonas de envío:</span>
                <span className="font-semibold">En configuración</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Costo de envío:</span>
                <span className="font-semibold">En configuración</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Envío gratis desde:</span>
                <span className="font-semibold">En configuración</span>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🔐</span>
              Configuración de Seguridad
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">SSL habilitado:</span>
                <span className="font-semibold text-green-600">✅ Activo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Autenticación 2FA:</span>
                <span className="font-semibold text-yellow-600">⏳ En desarrollo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Backup automático:</span>
                <span className="font-semibold text-yellow-600">⏳ En desarrollo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Panel de Configuración en Desarrollo</h2>
          <p className="text-gray-500">Las opciones de configuración avanzada estarán disponibles próximamente.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;
