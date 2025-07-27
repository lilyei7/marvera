/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#005187",      // Azul oscuro principal de la paleta
        secondary: "#4d82bc",    // Azul medio de la paleta
        accent: "#84b6f4",       // Azul claro de la paleta
        light: "#c4dafa",        // Azul muy claro de la paleta
        background: "#fcffff",   // Blanco de la paleta
        // Mantener colores de marina para compatibilidad
        button: "#4d82bc",       // Usar secondary para botones
        marina: {
          50: '#fcffff',    
          100: '#c4dafa',   
          200: '#84b6f4',   
          300: '#4d82bc',   
          400: '#005187',   
          500: '#004d7a',   
          600: '#004066',   
          700: '#003354',   
          800: '#002642',   
          900: '#001a30',   
        },
      },
      fontFamily: {
        'montserrat': ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
