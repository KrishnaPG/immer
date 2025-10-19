/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        affine: {
          primary: 'var(--affine-primary)',
          background: 'var(--affine-background)',
          border: 'var(--affine-border)',
          text: 'var(--affine-text)',
        }
      },
      animation: {
        'affine-appear': 'affine-appear 0.3s ease-out',
        'affine-disappear': 'affine-disappear 0.3s ease-in',
      },
      keyframes: {
        'affine-appear': {
          from: {
            opacity: '0',
            transform: 'scale(0.8)',
          },
          to: {
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        'affine-disappear': {
          from: {
            opacity: '1',
            transform: 'scale(1)',
          },
          to: {
            opacity: '0',
            transform: 'scale(0.8)',
          },
        },
      },
    },
  },
  plugins: [],
}