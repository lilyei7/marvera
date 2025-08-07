import { useMediaQuery } from 'react-responsive';

// Hook personalizado para breakpoints de MarVera
export const useResponsive = () => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1279 });
  const isLargeDesktop = useMediaQuery({ minWidth: 1280 });
  
  const isSmallScreen = useMediaQuery({ maxWidth: 1023 }); // Mobile + Tablet
  const isLargeScreen = useMediaQuery({ minWidth: 1024 }); // Desktop +
  
  return {
    isMobile,
    isTablet, 
    isDesktop,
    isLargeDesktop,
    isSmallScreen,
    isLargeScreen,
    
    // Helpers específicos para MarVera
    shouldShowMobileNav: isMobile,
    shouldShowSidebar: isLargeScreen,
    shouldUseCompactLayout: isSmallScreen,
    productsPerRow: isMobile ? 1 : isTablet ? 2 : isDesktop ? 3 : 4,
    shouldShowImageThumbnails: isLargeScreen,
    shouldUseLargeCards: isLargeDesktop,
  };
};

// Breakpoints Tailwind personalizados para MarVera
export const BREAKPOINTS = {
  mobile: '0px',
  tablet: '768px', 
  desktop: '1024px',
  largeDesktop: '1280px',
  ultraWide: '1536px',
} as const;

// Utilidades de responsive design
export const responsiveClasses = {
  // Grid responsivo para productos
  productGrid: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6',
  
  // Contenedores responsivos
  container: 'container mx-auto px-4 sm:px-6 lg:px-8',
  sectionPadding: 'py-8 md:py-12 lg:py-16',
  
  // Tipografía responsiva
  heading1: 'text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold',
  heading2: 'text-xl md:text-2xl lg:text-3xl font-semibold',
  heading3: 'text-lg md:text-xl lg:text-2xl font-medium',
  body: 'text-sm md:text-base',
  
  // Botones responsivos
  button: 'px-4 py-2 md:px-6 md:py-3 text-sm md:text-base',
  buttonLarge: 'px-6 py-3 md:px-8 md:py-4 text-base md:text-lg',
  
  // Cards responsivos
  card: 'rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition-all',
  
  // Espaciado responsivo
  spacing: {
    xs: 'space-y-2 md:space-y-3',
    sm: 'space-y-3 md:space-y-4', 
    md: 'space-y-4 md:space-y-6',
    lg: 'space-y-6 md:space-y-8',
    xl: 'space-y-8 md:space-y-12',
  },
};
