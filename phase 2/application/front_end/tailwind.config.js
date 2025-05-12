/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#181a1b', // main background
          800: '#23272a', // card background
          700: '#2c2f33', // input background
          600: '#36393f', // border
        },
        green: {
          900: '#0b2e13', // dark green
          800: '#14532d',
          700: '#166534',
          600: '#15803d',
          500: '#22c55e',
        },
      },
    },
  },
  plugins: [],
}

