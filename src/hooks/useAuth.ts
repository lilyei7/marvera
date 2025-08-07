import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { verifyToken, clearAuth } from '../store/slices/authSlice';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, token } = useAppSelector((state) => state.auth);
  const [hasCheckedToken, setHasCheckedToken] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const localToken = localStorage.getItem('token');
      
      console.log('🔐 useAuth - Verificando autenticación:', {
        localToken: !!localToken,
        isAuthenticated,
        hasUser: !!user,
        hasCheckedToken
      });

      // Si ya tenemos usuario autenticado y token válido, no verificar de nuevo
      if (isAuthenticated && user && localToken) {
        console.log('✅ Usuario ya autenticado desde store');
        if (!hasCheckedToken) {
          setHasCheckedToken(true);
        }
        return;
      }

      // Si hay token pero no estamos autenticados, verificar token
      if (localToken && !isAuthenticated && !hasCheckedToken) {
        console.log('🔄 Verificando token...');
        setHasCheckedToken(true);
        
        try {
          await dispatch(verifyToken()).unwrap();
          console.log('✅ Token verificado correctamente');
        } catch (error) {
          console.error('❌ Error en verificación de token:', error);
          localStorage.removeItem('token');
          dispatch(clearAuth());
        }
      } else if (!localToken && !hasCheckedToken) {
        console.log('❌ No hay token, limpiando estado');
        setHasCheckedToken(true);
        dispatch(clearAuth());
      }
    };

    // Solo ejecutar si no hemos verificado aún
    if (!hasCheckedToken || (!isAuthenticated && localStorage.getItem('token'))) {
      checkAuth();
    }
  }, [dispatch, user, isAuthenticated, hasCheckedToken]);

  const logout = () => {
    localStorage.removeItem('token');
    dispatch(clearAuth());
    setHasCheckedToken(false);
  };

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || !hasCheckedToken,
    token,
    logout,
    hasCheckedToken
  };
};
