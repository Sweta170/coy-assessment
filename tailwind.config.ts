import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        coy: {
          primary: "#FF4458",
          secondary: "#FE3C72",
          dark: "#111418",
          card: "#1C2024",
          surface: "#242A30",
          accent: "#2693FF",
          pass: "#EA4335",
          like: "#00BA7C",
          superlike: "#00D2FF"
        }
      },
      keyframes: {
        matchPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        }
      },
      animation: {
        'match-pulse': 'matchPulse 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
export default config;
