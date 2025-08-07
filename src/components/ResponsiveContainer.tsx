import React from 'react';
import { useResponsive } from '../hooks/useResponsive';

// Componente responsivo para layouts
export const ResponsiveContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
}> = ({ children, className = '', mobileClassName = '', tabletClassName = '', desktopClassName = '' }) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  const responsiveClasses = [
    className,
    isMobile && mobileClassName,
    isTablet && tabletClassName, 
    isDesktop && desktopClassName,
  ].filter(Boolean).join(' ');
  
  return <div className={responsiveClasses}>{children}</div>;
};

export default ResponsiveContainer;
