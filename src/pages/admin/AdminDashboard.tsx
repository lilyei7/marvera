import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import {
  BuildingStorefrontIcon,
  CubeIcon,
  UsersIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  ArchiveBoxIcon,
  TagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PhotoIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { FRONTEND_ROUTES } from '../../config/routes';

const AdminDashboard: React.FC = () => {
  
  // Stats cards data
  const stats = [
    {
      title: 'Sucursales',
      value: '3',
      change: '+10%',
      trend: 'up',
      icon: BuildingStorefrontIcon,
      color: 'bg-blue-50 text-blue-600',
      iconBg: 'bg-blue-100'
    },
    {
      title: 'Productos',
      value: '156',
      change: '+5%',
      trend: 'up',
      icon: CubeIcon,
      color: 'bg-green-50 text-green-600',
      iconBg: 'bg-green-100'
    },
    {
      title: 'Usuarios',
      value: '1,200',
      change: '+15%',
      trend: 'up',
      icon: UsersIcon,
      color: 'bg-purple-50 text-purple-600',
      iconBg: 'bg-purple-100'
    },
    {
      title: 'Órdenes',
      value: '4,500',
      change: '+8%',
      trend: 'up',
      icon: ClipboardDocumentListIcon,
      color: 'bg-orange-50 text-orange-600',
      iconBg: 'bg-orange-100'
    }
  ];

  const adminCards = [
    {
      title: 'Gestión de Sucursales',
      description: 'Administra las sucursales de MarVera',
      icon: BuildingStorefrontIcon,
      href: FRONTEND_ROUTES.ADMIN.BRANCHES,
      gradient: 'from-blue-500 to-blue-600',
      image: '🏢'
    },
    {
      title: 'Gestión de Productos',
      description: 'Catálogo de productos y mariscos',
      icon: CubeIcon,
      href: FRONTEND_ROUTES.ADMIN.PRODUCTS,
      gradient: 'from-green-500 to-green-600',
      image: '🐟'
    },
    {
      title: 'Gestión de Categorías',
      description: 'Administra las categorías de productos',
      icon: TagIcon,
      href: FRONTEND_ROUTES.ADMIN.CATEGORIES,
      gradient: 'from-yellow-500 to-yellow-600',
      image: '🏷️'
    },
    {
      title: 'Ofertas Especiales',
      description: 'Gestión de ofertas y promociones',
      icon: PhotoIcon,
      href: FRONTEND_ROUTES.ADMIN.OFFERS,
      gradient: 'from-pink-500 to-pink-600',
      image: '🎯'
    },
    {
      title: 'Slideshow Banner',
      description: 'Gestión del slideshow principal',
      icon: PlayIcon,
      href: FRONTEND_ROUTES.ADMIN.SLIDESHOW,
      gradient: 'from-teal-500 to-teal-600',
      image: '🎬'
    },
    {
      title: 'Productos de Mayoreo',
      description: 'Gestión de ventas al por mayor',
      icon: ArchiveBoxIcon,
      href: FRONTEND_ROUTES.ADMIN.WHOLESALE,
      gradient: 'from-orange-500 to-orange-600',
      image: '📦'
    },
    {
      title: 'Gestión de Usuarios',
      description: 'Administra usuarios y permisos',
      icon: UsersIcon,
      href: FRONTEND_ROUTES.ADMIN.USERS,
      gradient: 'from-purple-500 to-purple-600',
      image: '👥'
    },
    {
      title: 'Órdenes y Pedidos',
      description: 'Seguimiento de pedidos y entregas',
      icon: ClipboardDocumentListIcon,
      href: FRONTEND_ROUTES.ADMIN.ORDERS,
      gradient: 'from-red-500 to-red-600',
      image: '🛒'
    },
    {
      title: 'Reportes y Analytics',
      description: 'Estadísticas y reportes de ventas',
      icon: ChartBarIcon,
      href: FRONTEND_ROUTES.ADMIN.ANALYTICS,
      gradient: 'from-indigo-500 to-indigo-600',
      image: '📊'
    },
    {
      title: 'Configuración',
      description: 'Configuración general del sistema',
      icon: CogIcon,
      href: FRONTEND_ROUTES.ADMIN.SETTINGS,
      gradient: 'from-gray-500 to-gray-600',
      image: '⚙️'
    }
  ];

  return (
    <AdminLayout 
      title="Panel de Administración"
      subtitle="Bienvenido al sistema de administración de MarVera"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
          
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                  <IconComponent className={`h-6 w-6 ${stat.color.split(' ')[1]}`} />
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendIcon className="h-4 w-4 mr-1" />
                  {stat.change}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Acciones</h2>
        
        {/* Admin Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adminCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Link
                key={card.title}
                to={card.href}
                className="group relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Background Image/Gradient */}
                <div className={`h-32 bg-gradient-to-br ${card.gradient} flex items-center justify-center relative overflow-hidden`}>
                  <div className="text-4xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                    {card.image}
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                      {card.title}
                    </h3>
                    <IconComponent className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors" />
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {card.description}
                  </p>
                  
                  <div className="flex items-center text-primary font-medium text-sm group-hover:text-primary-dark">
                    <span>Administrar</span>
                    <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Actividad Reciente</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-600">Nueva sucursal agregada: MarVera Polanco</span>
              <span className="text-gray-400 ml-auto">Hace 2 horas</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-600">Producto actualizado: Camarón Jumbo</span>
              <span className="text-gray-400 ml-auto">Hace 4 horas</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
              <span className="text-gray-600">Nueva orden recibida #MV-2025-001</span>
              <span className="text-gray-400 ml-auto">Hace 6 horas</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              <span className="text-gray-600">Nueva categoría creada: Pescados Premium</span>
              <span className="text-gray-400 ml-auto">Hace 8 horas</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
