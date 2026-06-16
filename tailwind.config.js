/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#000000',   // Pure minimalist black canvas
        card: 'rgba(15, 15, 15, 0.55)', // Translucent matte dark card
        primary: '#7B61FF',      // Refined premium purple accent
        secondary: '#10B981',    // Standard green for success/validation
        error: '#E11D48',        // Standard red for failure/errors
        textPrimary: '#F9FAFB',  // Clean neutral off-white
        textMuted: '#9CA3AF',    // Balanced neutral slate grey
        borderColor: 'rgba(123, 97, 255, 0.12)', // Translucent purple border
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        space: ['Inter', 'sans-serif'],
        mono: ['monospace'],
      }
    },
  },
  plugins: [],
}
