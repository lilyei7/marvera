import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';
import { ResponsiveGrid, ResponsiveText } from './ResponsiveComponents';

// Layout admin responsivo
interface ResponsiveAdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
}

export const ResponsiveAdminLayout: React.FC<ResponsiveAdminLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
  sidebar
}) => {
  const { shouldUseCompactLayout, shouldShowSidebar } = useResponsive();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header del admin */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className={`${shouldUseCompactLayout ? 'px-4 py-4' : 'px-6 py-6'}`}>
          <div className="max-w-7xl mx-auto">
            <div className={`${shouldUseCompactLayout ? 'space-y-4' : 'flex justify-between items-center'}`}>
              <div>
                <ResponsiveText variant="h1" className="text-gray-900">
                  {title}
                </ResponsiveText>
                {subtitle && (
                  <ResponsiveText variant="body" className="text-gray-600 mt-2">
                    {subtitle}
                  </ResponsiveText>
                )}
              </div>
              {actions && (
                <div className={shouldUseCompactLayout ? 'w-full' : 'flex-shrink-0'}>
                  {actions}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto">
        {shouldShowSidebar && sidebar ? (
          // Layout con sidebar en desktop
          <div className="flex">
            <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
              <div className="p-6">
                {sidebar}
              </div>
            </aside>
            <main className="flex-1">
              <div className={shouldUseCompactLayout ? 'p-4' : 'p-6'}>
                {children}
              </div>
            </main>
          </div>
        ) : (
          // Layout sin sidebar o móvil
          <main>
            <div className={shouldUseCompactLayout ? 'p-4' : 'p-6'}>
              {children}
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

// Card admin responsivo
interface ResponsiveAdminCardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  actions?: React.ReactNode;
}

export const ResponsiveAdminCard: React.FC<ResponsiveAdminCardProps> = ({
  children,
  title,
  className = '',
  actions
}) => {
  const { shouldUseCompactLayout } = useResponsive();

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {title && (
        <div className={`border-b border-gray-200 ${shouldUseCompactLayout ? 'px-4 py-4' : 'px-6 py-4'}`}>
          <div className={`${shouldUseCompactLayout ? 'space-y-2' : 'flex justify-between items-center'}`}>
            <ResponsiveText variant="h3" className="text-gray-900">
              {title}
            </ResponsiveText>
            {actions && (
              <div className={shouldUseCompactLayout ? 'w-full' : 'flex-shrink-0'}>
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className={shouldUseCompactLayout ? 'p-4' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};

// Tabla admin responsiva
interface ResponsiveAdminTableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveAdminTable: React.FC<ResponsiveAdminTableProps> = ({
  headers,
  children,
  className = ''
}) => {
  const { shouldUseCompactLayout } = useResponsive();

  if (shouldUseCompactLayout) {
    // Vista de cards en móvil
    return (
      <div className={`space-y-4 ${className}`}>
        {children}
      </div>
    );
  }

  // Vista de tabla en desktop
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {children}
        </tbody>
      </table>
    </div>
  );
};

// Stats cards responsivos
interface Stat {
  name: string;
  value: string | number;
  change?: {
    value: string;
    type: 'increase' | 'decrease';
  };
  icon?: React.ComponentType<any>;
}

interface ResponsiveStatsGridProps {
  stats: Stat[];
  className?: string;
}

export const ResponsiveStatsGrid: React.FC<ResponsiveStatsGridProps> = ({
  stats,
  className = ''
}) => {
  const { shouldUseCompactLayout } = useResponsive();

  return (
    <ResponsiveGrid
      cols={{
        mobile: 1,
        tablet: 2,
        desktop: 4,
        largeDesktop: 4
      }}
      gap="md"
      className={className}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <ResponsiveText variant="body" className="text-gray-600 text-sm">
                {stat.name}
              </ResponsiveText>
              <ResponsiveText 
                variant={shouldUseCompactLayout ? "h2" : "h1"} 
                className="text-gray-900 mt-1"
              >
                {stat.value}
              </ResponsiveText>
              {stat.change && (
                <div className="flex items-center mt-2">
                  <span
                    className={`text-sm font-medium ${
                      stat.change.type === 'increase' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}
                  >
                    {stat.change.type === 'increase' ? '+' : '-'}{stat.change.value}
                  </span>
                </div>
              )}
            </div>
            {stat.icon && (
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-blue-600" />
              </div>
            )}
          </div>
        </div>
      ))}
    </ResponsiveGrid>
  );
};

// Form field responsivo
interface ResponsiveFormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
}

export const ResponsiveFormField: React.FC<ResponsiveFormFieldProps> = ({
  label,
  children,
  error,
  required = false,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Botones admin responsivos
interface ResponsiveAdminButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const ResponsiveAdminButton: React.FC<ResponsiveAdminButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  onClick,
  disabled = false,
  className = ''
}) => {
  const { shouldUseCompactLayout } = useResponsive();

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  };

  const sizeClasses = {
    sm: shouldUseCompactLayout ? 'px-3 py-2 text-sm' : 'px-3 py-2 text-sm',
    md: shouldUseCompactLayout ? 'px-4 py-3 text-base' : 'px-4 py-2 text-sm',
    lg: shouldUseCompactLayout ? 'px-6 py-4 text-lg' : 'px-6 py-3 text-base',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        font-medium rounded-lg
        focus:outline-none focus:ring-2 focus:ring-offset-2
        transition-colors duration-200
        ${className}
      `}
    >
      {children}
    </button>
  );
};
