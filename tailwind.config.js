/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0092bc',      // Tera Professional Blue
        secondary: '#FF9F1C',    // Tera Action Orange
        text: {
          main: '#1A1A1A',       // Dark Gray
          muted: '#666666',      // Medium Gray
        },
        bg: {
          main: '#FFFFFF',
          light: '#F5F5F5',
        },
        border: '#E0E0E0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        'page': '16px',
        'card': '12px',
      },
      borderRadius: {
        'card': '8px',
        'input': '4px',
      }
    },
  },
  plugins: [],
}