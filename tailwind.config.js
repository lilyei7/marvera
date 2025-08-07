/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🎨 Nueva Paleta de Colores MarVera
        'deep-navy': '#000020',      // Principal Oscuro
        'dark-blue': '#171a4a',      // Secundario Oscuro  
        'vibrant-blue': '#2f2c79',   // Acento Vibrante
        'light-peach': '#e8c39e',    // Neutro Claro
        'light-beige': '#f5e1ce',    // Fondo/Base
        
        // Aliases para facilidad de uso
        primary: '#000020',          // deep-navy
        secondary: '#171a4a',        // dark-blue
        accent: '#2f2c79',           // vibrant-blue
        light: '#e8c39e',            // light-peach
        background: '#f5e1ce',       // light-beige
        button: '#2f2c79',           // vibrant-blue para botones
        
        // Paleta extendida con variaciones
        marveraBlue: {
          50: '#f5e1ce',    // light-beige
          100: '#e8c39e',   // light-peach
          200: '#d4a574',   // variación más oscura
          300: '#b8874a',   // variación media
          400: '#9c6820',   // variación oscura
          500: '#2f2c79',   // vibrant-blue
          600: '#252052',   // variación más oscura
          700: '#1b143b',   // variación muy oscura
          800: '#171a4a',   // dark-blue
          900: '#000020',   // deep-navy
        },
        
        // Mantener compatibilidad con código existente
        marina: {
          50: '#f5e1ce',    
          100: '#e8c39e',   
          200: '#d4a574',   
          300: '#2f2c79',   
          400: '#171a4a',   
          500: '#000020',   
          600: '#000018',   
          700: '#000010',   
          800: '#000008',   
          900: '#000000',   
        },
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
      },
      screens: {
        'xs': '475px',
        // sm, md, lg, xl ya están definidos por defecto
      },
    },
  },
  plugins: [],
}
