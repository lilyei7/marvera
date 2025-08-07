import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useResponsive } from '../../hooks/useResponsive';
import { ResponsiveGrid, ResponsiveText } from './ResponsiveComponents';
import { FRONTEND_ROUTES } from '../../config/routes';

const ResponsiveFooter: React.FC = () => {
  const { shouldUseCompactLayout } = useResponsive();

  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Navegación',
      links: [
        { name: 'Inicio', href: FRONTEND_ROUTES.HOME },
        { name: 'Productos', href: FRONTEND_ROUTES.PRODUCTS },
        { name: 'Mayoreo', href: FRONTEND_ROUTES.WHOLESALE },
        { name: 'Sucursales', href: FRONTEND_ROUTES.BRANCHES },
      ]
    },
    {
      title: 'Información',
      links: [
        { name: 'Acerca de Nosotros', href: '/nosotros' },
        { name: 'Términos y Condiciones', href: '/terminos' },
        { name: 'Política de Privacidad', href: '/privacidad' },
        { name: 'Preguntas Frecuentes', href: '/faq' },
      ]
    },
    {
      title: 'Atención al Cliente',
      links: [
        { name: 'Contacto', href: '/contacto' },
        { name: 'Soporte', href: '/soporte' },
        { name: 'Devoluciones', href: '/devoluciones' },
        { name: 'Seguimiento de Pedidos', href: '/rastreo' },
      ]
    }
  ];

  const contactInfo = [
    {
      icon: PhoneIcon,
      title: 'Teléfono',
      info: '+52 55 1234 5678',
      href: 'tel:+525512345678'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email',
      info: 'contacto@marvera.mx',
      href: 'mailto:contacto@marvera.mx'
    },
    {
      icon: MapPinIcon,
      title: 'Dirección',
      info: 'Ciudad de México, México',
      href: FRONTEND_ROUTES.BRANCHES
    },
    {
      icon: ClockIcon,
      title: 'Horarios',
      info: 'Lun-Dom: 6:00 AM - 10:00 PM',
      href: null
    }
  ];

  if (shouldUseCompactLayout) {
    // Layout móvil simplificado
    return (
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Logo y descripción */}
          <div className="text-center mb-8">
            <Link to={FRONTEND_ROUTES.HOME} className="inline-block mb-4">
              <img
                src="/logomarvera.png"
                alt="MarVera"
                className="h-12 w-auto mx-auto"
              />
            </Link>
            <ResponsiveText variant="body" className="text-gray-300 max-w-sm mx-auto">
              Los mejores mariscos frescos de México, directo a tu mesa.
            </ResponsiveText>
          </div>

          {/* Enlaces principales */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {footerSections.slice(0, 2).map((section) => (
              <div key={section.title}>
                <ResponsiveText variant="h3" className="text-white font-semibold mb-3">
                  {section.title}
                </ResponsiveText>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-gray-300 hover:text-white transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Información de contacto compacta */}
          <div className="space-y-4 mb-8">
            <ResponsiveText variant="h3" className="text-white font-semibold">
              Contacto
            </ResponsiveText>
            <div className="space-y-3">
              {contactInfo.slice(0, 2).map((item) => (
                <div key={item.title} className="flex items-center space-x-3">
                  <item.icon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-gray-300 hover:text-white transition-colors text-sm"
                    >
                      {item.info}
                    </a>
                  ) : (
                    <span className="text-gray-300 text-sm">{item.info}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 pt-6 text-center">
            <ResponsiveText variant="body" className="text-gray-400 text-sm">
              © {currentYear} MarVera. Todos los derechos reservados.
            </ResponsiveText>
          </div>
        </div>
      </footer>
    );
  }

  // Layout desktop completo
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Contenido principal del footer */}
        <div className="py-12">
          <ResponsiveGrid
            cols={{
              mobile: 1,
              tablet: 2,
              desktop: 4,
              largeDesktop: 4
            }}
            gap="lg"
          >
            
            {/* Información de la empresa */}
            <div className="lg:col-span-1">
              <Link to={FRONTEND_ROUTES.HOME} className="inline-block mb-6">
                <img
                  src="/logomarvera.png"
                  alt="MarVera"
                  className="h-12 w-auto"
                />
              </Link>
              
              <ResponsiveText variant="body" className="text-gray-300 mb-6 leading-relaxed">
                Especialistas en mariscos frescos con más de 20 años de experiencia. 
                Ofrecemos la mejor calidad directamente desde las costas mexicanas.
              </ResponsiveText>

              {/* Redes sociales */}
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors"
                  aria-label="Twitter"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447c0-1.297.49-2.448 1.297-3.323.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323 0 1.297-.49 2.448-1.297 3.323-.875.807-2.026 1.297-3.323 1.297zm7.83-9.605c-.807 0-1.458-.651-1.458-1.458s.651-1.458 1.458-1.458 1.458.651 1.458 1.458-.651 1.458-1.458 1.458z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Secciones de enlaces */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <ResponsiveText variant="h3" className="text-white font-semibold mb-6">
                  {section.title}
                </ResponsiveText>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          </ResponsiveGrid>
        </div>

        {/* Información de contacto */}
        <div className="border-t border-gray-700 py-8">
          <ResponsiveText variant="h3" className="text-white font-semibold mb-6 text-center lg:text-left">
            Información de Contacto
          </ResponsiveText>
          
          <ResponsiveGrid
            cols={{
              mobile: 1,
              tablet: 2,
              desktop: 4,
              largeDesktop: 4
            }}
            gap="md"
          >
            {contactInfo.map((item) => (
              <div key={item.title} className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start space-x-3 mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <item.icon className="h-4 w-4 text-white" />
                  </div>
                  <ResponsiveText variant="body" className="text-white font-medium">
                    {item.title}
                  </ResponsiveText>
                </div>
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {item.info}
                  </a>
                ) : (
                  <ResponsiveText variant="body" className="text-gray-300 text-sm">
                    {item.info}
                  </ResponsiveText>
                )}
              </div>
            ))}
          </ResponsiveGrid>
        </div>

        {/* Copyright y enlaces legales */}
        <div className="border-t border-gray-700 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <ResponsiveText variant="body" className="text-gray-400 text-sm">
              © {currentYear} MarVera - Mariscos y Pescados. Todos los derechos reservados.
            </ResponsiveText>
            
            <div className="flex space-x-6 text-sm">
              <Link to="/terminos" className="text-gray-400 hover:text-white transition-colors">
                Términos de Servicio
              </Link>
              <Link to="/privacidad" className="text-gray-400 hover:text-white transition-colors">
                Política de Privacidad
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Política de Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ResponsiveFooter;
