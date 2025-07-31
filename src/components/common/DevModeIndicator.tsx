import React from 'react';

const DevModeIndicator: React.FC = () => {
  // Solo mostrar en desarrollo local
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-50 bg-yellow-500 text-black px-3 py-2 rounded-full shadow-lg text-sm font-medium opacity-90 hover:opacity-100 transition-opacity">
      🛠️ Modo Local - {import.meta.env.VITE_API_URL || 'http://localhost:5173'}
    </div>
  );
};

export default DevModeIndicator;
