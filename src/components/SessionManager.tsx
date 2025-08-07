import React, { useEffect, useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { verifyToken } from '../store/slices/authSlice';
import { fetchProducts } from '../store/slices/productsSlice';
import { fetchFeaturedProducts } from '../store/slices/featuredProductsSlice';

interface SessionManagerProps {
  children: React.ReactNode;
}

const SessionManager: React.FC<SessionManagerProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Inicializando aplicación...');
        
        // Verificar token de autenticación si existe
        const token = localStorage.getItem('token');
        if (token) {
          console.log('🔍 Token encontrado, verificando...');
          try {
            await dispatch(verifyToken()).unwrap();
            console.log('✅ Token verificado correctamente');
          } catch (error) {
            console.error('❌ Token inválido, limpiando...', error);
            localStorage.removeItem('token');
          }
        }

        // Cargar datos principales de la aplicación
        console.log('📦 Cargando datos principales...');
        
        // Cargar productos destacados primero
        await dispatch(fetchFeaturedProducts());
        
        // Pequeño delay para evitar sobrecarga
        setTimeout(() => {
          dispatch(fetchProducts());
        }, 800);
        
        setIsInitialized(true);
        console.log('✅ Aplicación inicializada correctamente');
        
      } catch (error) {
        console.error('❌ Error en inicialización:', error);
        setIsInitialized(true); // Continuar aunque haya errores
      }
    };

    initializeApp();
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-blue-800 mb-2">MarVera</h2>
          <p className="text-blue-600">Inicializando aplicación...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SessionManager;
