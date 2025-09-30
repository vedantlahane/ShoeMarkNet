/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'heading': ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        glass: {
          'bg': 'rgba(255, 255, 255, 0.08)',
          'border': 'rgba(255, 255, 255, 0.2)',
          'bg-dark': 'rgba(15, 23, 42, 0.1)',
          'border-dark': 'rgba(148, 163, 184, 0.1)',
        },
        gradient: {
          'primary': '#667eea',
          'primary-to': '#764ba2',
          'secondary': '#f093fb',
          'secondary-to': '#f5576c',
          'tertiary': '#4facfe',
          'tertiary-to': '#00f2fe',
          'accent': '#43e97b',
          'accent-to': '#38f9d7',
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-tertiary': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'gradient-accent': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'gradient-gold': 'linear-gradient(135deg, #ffd700 0%, #ffb347 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-effect': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
      },
      animation: {
        'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'slide-up': 'slide-up 0.6s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { 'box-shadow': '0 0 20px rgba(102, 126, 234, 0.4)' },
          '50%': { 'box-shadow': '0 0 30px rgba(102, 126, 234, 0.8)' },
        },
        'bounce-in': {
          '0%': {
            transform: 'scale(0.3) translateY(-100px)',
            opacity: '0',
          },
          '50%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': {
            transform: 'scale(1) translateY(0px)',
            opacity: '1',
          },
        },
        'slide-up': {
          from: {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'shimmer': {
          '0%': { 'background-position': '-468px 0' },
          '100%': { 'background-position': '468px 0' },
        },
        'fadeInUp': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
        'premium': '0 20px 40px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 30px rgba(102, 126, 234, 0.5)',
        'neon': '0 0 5px theme(colors.cyan.400), 0 0 20px theme(colors.cyan.400), 0 0 35px theme(colors.cyan.400)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
      screens: {
        'xs': '475px',
        '3xl': '1600px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.glass': {
          'background': 'var(--glass-bg)',
          'backdrop-filter': 'var(--glass-blur)',
          '-webkit-backdrop-filter': 'var(--glass-blur)',
          'border': '1px solid var(--glass-border)',
          'box-shadow': 'var(--glass-shadow)',
        },
        '.gradient-text': {
          'background': 'var(--gradient-primary)',
          '-webkit-background-clip': 'text',
          'background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-size': '200% 200%',
          'animation': 'gradient-shift 3s ease-in-out infinite',
        },
        '.hover-lift': {
          'transition': 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.hover-lift:hover': {
          'transform': 'translateY(-8px)',
          'box-shadow': '0 20px 40px rgba(0, 0, 0, 0.1)',
        },
        '.hover-scale': {
          'transition': 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
        '.hover-scale:hover': {
          'transform': 'scale(1.05)',
        },
        '.text-shadow': {
          'text-shadow': '2px 2px 4px rgba(0,0,0,0.1)',
        },
        '.text-shadow-lg': {
          'text-shadow': '4px 4px 8px rgba(0,0,0,0.12)',
        },
      }
      
      addUtilities(newUtilities)
    }
  ],
}
