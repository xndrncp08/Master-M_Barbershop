import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1240px" },
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0b0a08",
          950: "#070605",
          900: "#0b0a08",
          850: "#110f0c",
          800: "#16130f",
          700: "#1f1b15",
          600: "#2a251d",
        },
        cream: { DEFAULT: "#f5efe2", muted: "#b8ae9b", subtle: "#8a8170" },
        gold: {
          50: "#fbf4e2",
          100: "#f6e7bf",
          200: "#f2d58c",
          300: "#e8c06a",
          400: "#d4a64a",
          500: "#b98b34",
          600: "#966d27",
          700: "#6e501e",
        },
        pole: { red: "#c8243a", blue: "#2e55b8" },
        success: "#5fbf8a",
        danger: "#f07167",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        // Two-layer shadows: ambient + direct light.
        card: "0 1px 2px rgba(0,0,0,0.5), 0 12px 32px -12px rgba(0,0,0,0.7)",
        glow: "0 0 0 1px rgba(212,166,74,0.25), 0 10px 40px -10px rgba(212,166,74,0.45)",
      },
      keyframes: {
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        "dialog-in": {
          from: { opacity: "0", transform: "translateY(12px) scale(0.97)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        pulse: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.35" } },
      },
      animation: {
        "spin-slow": "spin-slow 4s linear infinite",
        "dialog-in": "dialog-in 260ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 200ms ease-out both",
        "pulse-dot": "pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
