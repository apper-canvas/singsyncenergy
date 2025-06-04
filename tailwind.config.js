/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF006E',
          light: '#FF4D9D',
          dark: '#CC0058'
        },
        secondary: {
          DEFAULT: '#8338EC',
          light: '#A366F0',
          dark: '#6B2BC4'
        },
        accent: '#FFBE0B',
        success: '#00F5FF',
        surface: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        heading: ['Montserrat', 'ui-sans-serif', 'system-ui']
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #0A0A0A 0%, #1A0033 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        'gradient-neon': 'linear-gradient(90deg, #FF006E 0%, #8338EC 50%, #FFBE0B 100%)'
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        'neu-light': '5px 5px 15px #d1d9e6, -5px -5px 15px #ffffff',
        'neu-dark': '5px 5px 15px rgba(0, 0, 0, 0.3), -5px -5px 15px rgba(255, 255, 255, 0.05)',
        'neon-primary': '0 0 20px rgba(255, 0, 110, 0.5), 0 0 40px rgba(255, 0, 110, 0.3)',
        'neon-secondary': '0 0 20px rgba(131, 56, 236, 0.5), 0 0 40px rgba(131, 56, 236, 0.3)',
        'glow': '0 0 30px rgba(255, 190, 11, 0.4)'
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem'
      },
      backdropBlur: {
        'glass': '20px'
      }
    }
  },
  plugins: [],
  darkMode: 'class',
}