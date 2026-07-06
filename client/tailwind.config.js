/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        fleet: {
          oxford: '#002147',
          navy: '#001b39',
          tan: '#d2b48c',
          tanVivid: '#f1cc98',
          sand: '#e7d7be',
          cream: '#f7f1e7'
        }
      },
      boxShadow: {
        glass: '0 8px 30px rgba(2, 6, 23, 0.12)'
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)'
      }
    }
  },
  plugins: []
};
