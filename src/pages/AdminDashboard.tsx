import React, { useState } from 'react';
import { 
  HomeIcon, 
  TagIcon, 
  StarIcon, 
  ShoppingBagIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import CategoryManagerNew from '../components/admin/CategoryManagerNew';
import FeaturedProductsAdmin from '../components/admin/FeaturedProductsAdmin';
import ProductsManager from '../components/admin/ProductsManager';

interface MenuItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: <HomeIcon className="h-6 w-6" />,
      component: (
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Administrativo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <ShoppingBagIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Productos</p>
                  <p className="text-2xl font-semibold text-gray-900">156</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <TagIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Categorías</p>
                  <p className="text-2xl font-semibold text-gray-900">8</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <StarIcon className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Destacados</p>
                  <p className="text-2xl font-semibold text-gray-900">3</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <UsersIcon className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Usuarios</p>
                  <p className="text-2xl font-semibold text-gray-900">1,234</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'products',
      name: 'Productos',
      icon: <ShoppingBagIcon className="h-6 w-6" />,
      component: <ProductsManager />
    },
    {
      id: 'categories',
      name: 'Categorías',
      icon: <TagIcon className="h-6 w-6" />,
      component: <CategoryManagerNew />
    },
    {
      id: 'featured',
      name: 'Productos Destacados',
      icon: <StarIcon className="h-6 w-6" />,
      component: <FeaturedProductsAdmin />
    }
  ];

  const activeMenuItem = menuItems.find(item => item.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Panel de Administración</h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500">MarVera Admin</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <nav className="mt-8">
            <div className="px-4">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeMenuItem?.component}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
