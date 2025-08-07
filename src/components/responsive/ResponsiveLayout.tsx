import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

// Layout principal responsivo para toda la aplicación
interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  isFullWidth?: boolean;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className = '',
  isFullWidth = false,
}) => {
  const { shouldUseCompactLayout } = useResponsive();

  const layoutClasses = [
    'min-h-screen',
    'flex flex-col',
    isFullWidth ? 'w-full' : 'max-w-7xl mx-auto',
    shouldUseCompactLayout ? 'px-4' : 'px-6 lg:px-8',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={layoutClasses}>
      {children}
    </div>
  );
};

// Header responsivo principal
interface ResponsiveHeaderProps {
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

export const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  children,
  className = '',
  sticky = true,
}) => {
  const { shouldUseCompactLayout } = useResponsive();

  const headerClasses = [
    'w-full',
    'bg-white',
    'border-b border-gray-200',
    sticky && 'sticky top-0 z-50',
    shouldUseCompactLayout ? 'py-3' : 'py-4',
    'shadow-sm',
    className,
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClasses}>
      <div className={shouldUseCompactLayout ? 'px-4' : 'px-6 lg:px-8'}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </header>
  );
};

// Contenedor principal responsivo
interface ResponsiveMainProps {
  children: React.ReactNode;
  className?: string;
  sidebar?: React.ReactNode;
  sidebarPosition?: 'left' | 'right';
}

export const ResponsiveMain: React.FC<ResponsiveMainProps> = ({
  children,
  className = '',
  sidebar,
  sidebarPosition = 'left',
}) => {
  const { shouldShowSidebar, shouldUseCompactLayout } = useResponsive();

  if (!shouldShowSidebar || !sidebar) {
    // Sin sidebar en móvil o si no se proporciona
    return (
      <main className={`flex-1 ${shouldUseCompactLayout ? 'p-4' : 'p-6 lg:p-8'} ${className}`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    );
  }

  // Con sidebar en desktop
  return (
    <main className={`flex-1 flex ${className}`}>
      {sidebarPosition === 'left' && (
        <aside className="w-64 bg-white border-r border-gray-200 p-6">
          {sidebar}
        </aside>
      )}
      <div className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
      {sidebarPosition === 'right' && (
        <aside className="w-64 bg-white border-l border-gray-200 p-6">
          {sidebar}
        </aside>
      )}
    </main>
  );
};

// Footer responsivo
interface ResponsiveFooterProps {
  children?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export const ResponsiveFooter: React.FC<ResponsiveFooterProps> = ({
  children,
  className = '',
  compact = false,
}) => {
  const { shouldUseCompactLayout } = useResponsive();

  const footerClasses = [
    'bg-gray-900 text-white',
    'border-t border-gray-700',
    shouldUseCompactLayout || compact ? 'py-6' : 'py-12',
    className,
  ].filter(Boolean).join(' ');

  return (
    <footer className={footerClasses}>
      <div className={`max-w-7xl mx-auto ${shouldUseCompactLayout ? 'px-4' : 'px-6 lg:px-8'}`}>
        {children}
      </div>
    </footer>
  );
};

// Sección responsiva para contenido
interface ResponsiveSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  background?: 'white' | 'gray' | 'blue' | 'transparent';
}

export const ResponsiveSection: React.FC<ResponsiveSectionProps> = ({
  children,
  className = '',
  title,
  subtitle,
  size = 'md',
  background = 'transparent',
}) => {
  const { shouldUseCompactLayout } = useResponsive();

  const sizeClasses = {
    sm: shouldUseCompactLayout ? 'py-6' : 'py-8',
    md: shouldUseCompactLayout ? 'py-8' : 'py-12',
    lg: shouldUseCompactLayout ? 'py-10' : 'py-16',
    xl: shouldUseCompactLayout ? 'py-12' : 'py-20',
  };

  const backgroundClasses = {
    white: 'bg-white',
    gray: 'bg-gray-50',
    blue: 'bg-blue-50',
    transparent: '',
  };

  const sectionClasses = [
    'w-full',
    sizeClasses[size],
    backgroundClasses[background],
    className,
  ].filter(Boolean).join(' ');

  return (
    <section className={sectionClasses}>
      <div className={`max-w-7xl mx-auto ${shouldUseCompactLayout ? 'px-4' : 'px-6 lg:px-8'}`}>
        {(title || subtitle) && (
          <div className={`text-center ${shouldUseCompactLayout ? 'mb-6' : 'mb-12'}`}>
            {title && (
              <h2 className={`font-bold text-gray-900 ${
                shouldUseCompactLayout 
                  ? 'text-2xl mb-2' 
                  : 'text-3xl lg:text-4xl mb-4'
              }`}>
                {title}
              </h2>
            )}
            {subtitle && (
              <p className={`text-gray-600 max-w-3xl mx-auto ${
                shouldUseCompactLayout 
                  ? 'text-base' 
                  : 'text-lg lg:text-xl'
              }`}>
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};
