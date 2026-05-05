/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /** Site theme — amber CTAs / headings accent */
        primary: '#faa853',
        'primary-hover': '#e89235',
        /** Navy — nav text, hero overlay, footer */
        secondary: '#2d3f5d',
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        /** Hero headlines — modern sans for teens / upper grades */
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}