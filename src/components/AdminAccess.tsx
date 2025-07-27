import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser } from '../store/slices/authSlice';
import { EyeIcon, EyeSlashIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const AdminAccess: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector(state => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin',
    password: 'admin'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await dispatch(loginUser({
      email: formData.email,
      password: formData.password
    }));
    
    if (loginUser.fulfilled.match(result)) {
      navigate('/');
    }
  };

  const handleQuickLogin = () => {
    setFormData({ email: 'admin', password: 'admin' });
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl p-8 max-w-md w-full border border-default">
        <div className="text-center mb-8">
          <ShieldCheckIcon className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-main mb-2">
            🔐 Acceso Admin
          </h1>
          <p className="text-muted">
            Panel de administración MarVera
          </p>
        </div>

        <div className="bg-light bg-opacity-50 rounded-lg p-4 mb-6 border border-primary border-opacity-20">
          <h3 className="font-semibold text-primary mb-2">📋 Credenciales de Demo:</h3>
          <div className="text-sm text-muted space-y-1">
            <p><strong>Usuario:</strong> admin</p>
            <p><strong>Contraseña:</strong> admin</p>
          </div>
          <button
            onClick={handleQuickLogin}
            className="mt-3 w-full bg-secondary text-white py-2 px-4 rounded-lg hover:bg-primary transition-colors duration-200 text-sm font-medium"
          >
            🚀 Acceso Rápido
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-main mb-1">
              Usuario
            </label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 hover:shadow-md bg-background text-main"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-main mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-default rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary pr-10 transition-all duration-300 hover:shadow-md bg-background text-main"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted hover:text-main"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-button text-white py-3 px-4 rounded-lg hover:bg-primary focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {isLoading ? '🔄 Verificando...' : '🔐 Iniciar Sesión Admin'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-secondary hover:text-primary font-medium transition-colors duration-200"
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminAccess;
