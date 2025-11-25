/** @type {import('tailwindcss').Config} */
module.exports = {
  // Pastikan path ini mengarah ke folder src tempat file Next.js berada
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Palette Warna "Executive Professional"
      colors: {
        primary: {
          DEFAULT: "#0D1B2A", // Deep Navy - Trust & Authority
          hover: "#1B2A3F",
        },
        secondary: {
          DEFAULT: "#1B998B", // Teal - Growth & Modernity
          hover: "#147D70",
        },
        background: "#F9FAFB", // Soft Gray - Clean Canvas
        surface: "#FFFFFF",    // White - Cards
        accent: "#F0FDFA",     // Light Teal - Subtle Highlight
        feedback: "#FFDD8A",   // Amber - Improvement Indicators
        
        "text-main": "#111827", // Near Black
        "text-sub": "#4B5563",  // Dark Gray
        "text-muted": "#9CA3AF", // Light Gray
      },
      
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      
      // Shadow yang lembut untuk kesan modern
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        'glow': '0 0 15px rgba(27, 153, 139, 0.3)',
      },
      
      // --- ANIMASI & KEYFRAMES ---
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'blob': 'blob 7s infinite', // Animasi untuk background landing page
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Animasi Blob: Bergerak memutar dan berubah ukuran secara organik
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
    },
  },
  plugins: [
    // Plugin Typography penting untuk merender Markdown di halaman Result
    require('@tailwindcss/typography'),
  ],
};