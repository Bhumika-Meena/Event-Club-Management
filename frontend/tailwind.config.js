module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        neon: {
          pink: '#ff4ecd',
          purple: '#a78bfa',
          blue: '#22d3ee',
          lime: '#a3e635',
          yellow: '#fde047'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(139, 92, 246, 0.35)',
        soft: '0 10px 30px rgba(2, 6, 23, 0.08)'
      },
      backgroundImage: {
        'fun-gradient': 'linear-gradient(135deg, #22d3ee 0%, #8b5cf6 45%, #ff4ecd 100%)',
        'glass-gradient': 'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.35) 100%)'
      }
    },
  },
  plugins: [],
}
