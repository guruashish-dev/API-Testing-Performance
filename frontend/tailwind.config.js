/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0b0d10",
        panel: "#12161c",
        panelSoft: "#171c23",
        accent: "#ffd54a",
        accentMuted: "#7a6322",
        text: "#f5f7fa",
        textMuted: "#93a0b2",
        danger: "#ff6b6b",
        success: "#41d392"
      },
      boxShadow: {
        glow: "0 0 30px rgba(255, 213, 74, 0.15)",
        soft: "0 12px 40px rgba(0, 0, 0, 0.35)",
      },
      backdropBlur: {
        xs: "2px",
      },
      fontFamily: {
        display: ["'Oswald'", "sans-serif"],
        body: ["'Manrope'", "sans-serif"],
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease-out both",
        pulseSlow: "pulseSlow 2.5s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: 0.85 },
          "50%": { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
