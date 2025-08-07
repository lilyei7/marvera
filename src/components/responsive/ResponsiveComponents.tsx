import React from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    largeDesktop?: number;
  };
}

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
}

// Componente responsivo para layouts
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  className = '', 
  mobileClassName = '', 
  tabletClassName = '', 
  desktopClassName = '' 
}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  const responsiveClasses = [
    className,
    isMobile && mobileClassName,
    isTablet && tabletClassName, 
    isDesktop && desktopClassName,
  ].filter(Boolean).join(' ');
  
  return <div className={responsiveClasses}>{children}</div>;
};

// Grid responsivo inteligente para productos
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  gap = 'md',
  cols = { mobile: 1, tablet: 2, desktop: 3, largeDesktop: 4 }
}) => {
  const { isMobile, isTablet, isDesktop, isLargeDesktop } = useResponsive();
  
  const gapClasses = {
    xs: 'gap-2',
    sm: 'gap-3',
    md: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8',
    xl: 'gap-8 md:gap-10'
  };
  
  const getCurrentCols = () => {
    if (isMobile) return cols.mobile || 1;
    if (isTablet) return cols.tablet || 2;
    if (isDesktop) return cols.desktop || 3;
    if (isLargeDesktop) return cols.largeDesktop || 4;
    return 4;
  };
  
  const currentCols = getCurrentCols();
  const gridClasses = `grid grid-cols-${currentCols} ${gapClasses[gap]} ${className}`;
  
  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

interface ResponsiveTextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  className?: string;
  align?: 'left' | 'center' | 'right';
}

// Texto responsivo con tipografía adaptativa
export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  variant = 'body',
  className = '',
  align = 'left'
}) => {
  const baseClasses = {
    h1: 'text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold',
    h2: 'text-xl md:text-2xl lg:text-3xl font-semibold',
    h3: 'text-lg md:text-xl lg:text-2xl font-medium',
    body: 'text-sm md:text-base',
    caption: 'text-xs md:text-sm text-gray-600'
  };
  
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  
  const Tag = variant === 'body' || variant === 'caption' ? 'p' : variant;
  
  return (
    <Tag className={`${baseClasses[variant]} ${alignClasses[align]} ${className}`}>
      {children}
    </Tag>
  );
};

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

// Imagen responsiva con lazy loading mejorado
export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false
}) => {
  const { isMobile } = useResponsive();
  
  return (
    <img
      src={src}
      alt={alt}
      className={`w-full h-auto object-cover ${className}`}
      loading={priority ? 'eager' : 'lazy'}
      sizes={sizes}
      style={{
        aspectRatio: isMobile ? '4/3' : '16/9',
      }}
    />
  );
};
