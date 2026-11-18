import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Fraunces', 'Playfair Display', 'Didot', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        coy: {
          bg: "#08090D",
          surface: "#11141D",
          card: "#181B26",
          border: "rgba(255, 255, 255, 0.08)",
          primary: "#FF2D55",
          primaryHover: "#FF456A",
          primaryGlow: "rgba(255, 45, 85, 0.35)",
          accent: "#FF6584",
          like: "#10B981",
          likeGlow: "rgba(16, 185, 129, 0.35)",
          nope: "#F43F5E",
          nopeGlow: "rgba(244, 63, 94, 0.35)",
          superlike: "#38BDF8",
          blush: "#FFE4E6",
          cream: "#FAF8F5",
          sand: "#E5DFD7",
          muted: "#8E96A4",
          subtle: "#4B5565",
        }
      },
      borderRadius: {
        '2xl': '1.25rem', // 20px
        '3xl': '1.75rem', // 28px
        '4xl': '2.25rem', // 36px
        '5xl': '2.75rem', // 44px
      },
      boxShadow: {
        'coy-card': '0 24px 48px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'coy-float': '0 12px 32px -8px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'coy-like': '0 10px 30px -5px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.3)',
        'coy-nope': '0 10px 30px -5px rgba(244, 63, 94, 0.4), 0 0 0 1px rgba(244, 63, 94, 0.3)',
        'coy-primary': '0 10px 30px -5px rgba(255, 45, 85, 0.45), 0 0 0 1px rgba(255, 45, 85, 0.3)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        heartFloat: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-6px) scale(1.06)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.08)' },
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite',
        'heart-float': 'heartFloat 2.8s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
export default config;
