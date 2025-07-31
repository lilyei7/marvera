import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { verifyToken } from '../store/slices/authSlice';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { user, isLoading, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Verificar token al cargar la ruta protegida
    const token = localStorage.getItem('token');
    console.log('🛡️ ProtectedRoute - Token en localStorage:', token ? token.substring(0, 20) + '...' : 'null');
    console.log('👤 Usuario actual:', user);
    console.log('🔒 Require admin:', requireAdmin);
    
    if (token && !user) {
      console.log('🔄 Verificando token...');
      dispatch(verifyToken());
    }
  }, [dispatch, user]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
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
