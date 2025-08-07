import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useResponsive } from '../../hooks/useResponsive';

interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<any>;
}

interface ResponsiveNavProps {
  logo: React.ReactNode;
  navigationItems: NavigationItem[];
  actions?: React.ReactNode;
  className?: string;
}

const ResponsiveNavigation: React.FC<ResponsiveNavProps> = ({
  logo,
  navigationItems,
  actions,
  className = ''
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { shouldShowMobileNav } = useResponsive();

  return (
    <nav className={`bg-white shadow-sm sticky top-0 z-50 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            {logo}
          </div>

          {/* Desktop Navigation */}
          {!shouldShowMobileNav && (
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-primary font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span>{item.name}</span>
                </a>
              ))}
            </div>
          )}

          {/* Desktop Actions */}
          {!shouldShowMobileNav && actions && (
            <div className="hidden md:flex items-center space-x-4">
              {actions}
            </div>
          )}

          {/* Mobile menu button */}
          {shouldShowMobileNav && (
            <div className="flex items-center space-x-2">
              {/* Mobile actions (compactas) */}
              {actions && (
                <div className="flex items-center space-x-2">
                  {actions}
                </div>
              )}
              
              <button
                type="button"
                className="p-2 rounded-md text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Abrir menú principal</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation Dialog */}
      <Dialog 
        as="div" 
        className="lg:hidden" 
        open={mobileMenuOpen} 
        onClose={setMobileMenuOpen}
      >
        <div className="fixed inset-0 z-50" />
        <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <div className="-m-1.5 p-1.5">
              {logo}
            </div>
            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700 hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="sr-only">Cerrar menú</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigationItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50 hover:text-primary transition-colors flex items-center space-x-3"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon && <item.icon className="h-5 w-5" />}
                    <span>{item.name}</span>
                  </a>
                ))}
              </div>
              
              {/* Mobile Actions (expandidas) */}
              {actions && (
                <div className="py-6">
                  <div className="space-y-3">
                    {actions}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Dialog.Panel>
      </Dialog>
    </nav>
  );
};

export default ResponsiveNavigation;
