/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ultra-Minimal Okapi Brown Palette - Pally Style (Updated for Figma match)
        'okapi-rich-brown': '#A0522D',
        'okapi-dark-brown': '#4A2C17',
        'okapi-light-brown': '#D6B88B', // Slightly warmer beige
        'okapi-cream': '#F7E9D7', // Slightly lighter cream
        'okapi-black': '#2E1A0E',
        'okapi-white': '#FFF8F0',
        
        // Single Accent Color
        'accent-green': '#00FF88',
        
        // Animal Pattern Colors
        'leopard-gold': '#CD853F',
        'leopard-dark': '#8B4513',
        'leopard-cream': '#F5DEB3',
        
        // Core System Colors
        background: '#F7E9D7', // warm beige background
        foreground: '#4A2C17', // dark brown text
        card: {
          DEFAULT: '#F5E6D3', // cream card background
          foreground: '#4A2C17',
        },
        popover: {
          DEFAULT: '#F5E6D3',
          foreground: '#4A2C17',
        },
        primary: {
          DEFAULT: '#A0522D', // rich brown for buttons
          foreground: '#FFF8F0',
        },
        secondary: {
          DEFAULT: '#D6B88B', // lighter brown for secondary buttons
          foreground: '#4A2C17',
        },
        muted: {
          DEFAULT: '#EDE1D6',
          foreground: '#7A5A3C',
        },
        accent: {
          DEFAULT: '#00FF88',
          foreground: '#004422',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFF8F0',
        },
        border: '#D6B88B',
        input: '#D6B88B',
        ring: '#A0522D',
        chart: {
          '1': '#A0522D',
          '2': '#D6B88B',
          '3': '#F7E9D7',
          '4': '#4A2C17',
          '5': '#FFF8F0',
        },
        sidebar: {
          DEFAULT: '#F5E6D3',
          foreground: '#4A2C17',
          primary: '#A0522D',
          'primary-foreground': '#FFF8F0',
          accent: '#00FF88',
          'accent-foreground': '#004422',
          border: '#D6B88B',
          ring: '#A0522D',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      },
      animation: {
        'pally-flow': 'pally-flow 180s infinite ease-in-out',
        'pally-atmosphere': 'pally-atmosphere 120s infinite ease-in-out',
        'pally-particle-drift': 'pally-particle-drift 200s infinite ease-in-out',
        'pally-organic-morph': 'pally-organic-morph 120s infinite ease-in-out',
        'pally-subtle-float': 'pally-subtle-float 80s infinite ease-in-out',
        'pally-gradient-shift': 'pally-gradient-shift 8s ease infinite',
        'pally-divider-flow': 'pally-divider-flow 10s infinite ease-in-out',
        'pally-shimmer-loading': 'pally-shimmer-loading 2s infinite ease-in-out',
        'pally-floating': 'pally-floating 12s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'pally': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
} 