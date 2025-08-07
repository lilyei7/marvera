import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading, hasCheckedToken } = useAuth();

  console.log('🛡️ ProtectedRoute - Estado:', {
    isAuthenticated,
    hasUser: !!user,
    userEmail: user?.email,
    userRole: user?.role,
    isLoading,
    hasCheckedToken,
    requireAdmin
  });

  // Solo mostrar loading si realmente está verificando el token
  if (isLoading && !hasCheckedToken) {
    console.log('⏳ ProtectedRoute - Cargando...');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated || !user) {
    console.log('❌ ProtectedRoute - No autenticado. isAuthenticated:', isAuthenticated, 'user:', user);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('✅ ProtectedRoute - Usuario autenticado:', user.email, 'Rol:', user.role);

  // Si requiere admin pero el usuario no es admin
  if (requireAdmin && !['admin', 'ADMIN', 'SUPER_ADMIN', 'MANAGER'].includes(user.role)) {
    console.log('❌ Acceso denegado - Rol del usuario:', user.role);
    console.log('🔑 Roles permitidos:', ['admin', 'ADMIN', 'SUPER_ADMIN', 'MANAGER']);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
            <div className="text-red-600 text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Acceso Denegado</h2>
            <p className="text-red-600 mb-4">
              No tienes permisos para acceder a esta sección.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Tu rol: {user.role} | Se requiere: Admin
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;