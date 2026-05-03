/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#101518",
        ember: "#f45d48",
        sand: "#f3e7d3",
        mist: "#e2f0f1",
        slate: "#2d3a40"
      },
      boxShadow: {
        glow: "0 0 40px rgba(244, 93, 72, 0.25)"
      }
    }
  },
  plugins: []
};
