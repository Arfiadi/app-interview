/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",      // <-- Pastikan ada src/
    "./src/components/**/*.{js,ts,jsx,tsx}", // <-- Pastikan ada src/
    "./src/hooks/**/*.{js,ts,jsx,tsx}",      // <-- Pastikan ada src/
  ],
  theme: {
    // ... theme setting kamu ...
    extend: {
      colors: {
        primary: { DEFAULT: "#0D1B2A", hover: "#1B2A3F" },
        secondary: { DEFAULT: "#1B998B", hover: "#147D70" },
        background: "#F9FAFB",
        surface: "#FFFFFF",
        accent: "#F0FDFA",
        feedback: "#FFDD8A",
        "text-main": "#111827",
        "text-sub": "#4B5563",
        "text-muted": "#9CA3AF",
      },
      // ... sisanya ...
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};