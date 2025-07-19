/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/templates/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        'expand': 'expand 0.3s ease-in-out',
        'collapse': 'collapse 0.3s ease-in-out',
      },
      keyframes: {
        expand: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(2)' },
        },
        collapse: {
          '0%': { transform: 'scale(2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};