import React, { useState, useEffect } from 'react';
import { 
  MapPinIcon, 
  PhoneIcon, 
  ClockIcon, 
  EnvelopeIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  openingHours?: string;
  services?: string;
  description?: string;
  image?: string;
  isActive: boolean;
}

const BranchesPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string>('all');

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando sucursales desde la base de datos...');
      
      // Usar la URL completa del backend
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_BASE_URL}/api/branches/public`);
      
      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Datos recibidos:', data);
      
      if (response.ok && data.success) {
        setBranches(data.branches || []);
        console.log('✅ Sucursales cargadas:', data.branches?.length || 0);
      } else {
        setError(data.message || 'Error al cargar sucursales');
        console.error('❌ Error en respuesta:', data);
      }
    } catch (err) {
      console.error('❌ Error fetching branches:', err);
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const cities = Array.from(new Set(branches.map(branch => branch.city)));

  const filteredBranches = selectedCity === 'all' 
    ? branches 
    : branches.filter(branch => branch.city === selectedCity);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-light to-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted">Cargando sucursales...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-light to-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar sucursales</h3>
              <p className="text-muted mb-4">{error}</p>
              <button
                onClick={fetchBranches}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Intentar de nuevo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-light to-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Nuestras Sucursales
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto">
            Encuentra la sucursal MarVera más cercana a ti y disfruta de los mejores mariscos frescos
          </p>
          
          {/* Debug info */}
          <div className="mt-4 text-sm text-gray-500">
            {loading ? '🔄 Cargando sucursales desde base de datos...' : 
             error ? '❌ Error de conexión' : 
             branches.length > 0 ? `✅ ${branches.length} sucursales desde base de datos` : 
             '⚠️ No hay sucursales disponibles'}
          </div>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCity('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedCity === 'all'
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              Todas las ciudades
            </button>
            {cities.map(city => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedCity === city
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBranches.map(branch => (
            <div
              key={branch.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Image */}
              <div className="h-48 bg-gradient-to-br from-primary to-accent relative overflow-hidden">
                {branch.image ? (
                  <img
                    src={branch.image}
                    alt={branch.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-white text-6xl">🏪</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">{branch.name}</h3>
                  <p className="text-white/90">{branch.city}, {branch.state}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Description */}
                {branch.description && (
                  <p className="text-muted mb-4 text-sm leading-relaxed">
                    {branch.description}
                  </p>
                )}

                {/* Address */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPinIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-900">{branch.address}</p>
                      <p className="text-xs text-muted">
                        {branch.city}, {branch.state} {branch.postalCode}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-primary flex-shrink-0" />
                    <a
                      href={`tel:${branch.phone}`}
                      className="text-sm text-gray-900 hover:text-primary transition-colors"
                    >
                      {branch.phone}
                    </a>
                  </div>

                  {/* Email */}
                  {branch.email && (
                    <div className="flex items-center space-x-3">
                      <EnvelopeIcon className="h-5 w-5 text-primary flex-shrink-0" />
                      <a
                        href={`mailto:${branch.email}`}
                        className="text-sm text-gray-900 hover:text-primary transition-colors"
                      >
                        {branch.email}
                      </a>
                    </div>
                  )}

                  {/* Hours */}
                  {branch.openingHours && (
                    <div className="flex items-start space-x-3">
                      <ClockIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-900">{branch.openingHours}</p>
                    </div>
                  )}

                </div>

                {/* Services */}
                {branch.services && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Servicios:</h4>
                    <p className="text-xs text-muted">{branch.services}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-6 flex space-x-2">
                  {branch.latitude && branch.longitude && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${branch.latitude},${branch.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-primary text-white text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                    >
                      Cómo llegar
                    </a>
                  )}
                  <a
                    href={`tel:${branch.phone}`}
                    className="flex-1 bg-accent text-white text-center py-2 px-4 rounded-lg text-sm font-medium hover:bg-accent-dark transition-colors"
                  >
                    Llamar
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBranches.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🏪</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay sucursales en esta ciudad
            </h3>
            <p className="text-muted">
              Selecciona otra ciudad o ve todas las sucursales disponibles
            </p>
          </div>
        )}

        {/* Contact Info */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">
            ¿No encuentras una sucursal cerca?
          </h2>
          <p className="text-muted mb-6">
            Contáctanos y te ayudaremos a encontrar la mejor opción para ti
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="tel:55-1234-5678"
              className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              📞 Llámanos: 55-1234-5678
            </a>
            <a
              href="mailto:info@marvera.com"
              className="bg-accent text-white px-6 py-3 rounded-lg font-medium hover:bg-accent-dark transition-colors"
            >
              ✉️ Escríbenos: info@marvera.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchesPage;
