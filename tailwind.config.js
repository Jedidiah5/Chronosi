/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        pop: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.0)' },
          '50%': { boxShadow: '0 0 0 6px rgba(37, 99, 235, 0.2)' },
          '100%': { boxShadow: '0 0 0 0 rgba(37, 99, 235, 0.0)' }
        }
      },
      animation: {
        pop: 'pop 500ms ease-out',
        glow: 'glow 800ms ease-out'
      }
    },
  },
  plugins: [],
};
