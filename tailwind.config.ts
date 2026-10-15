import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        beauty: {
          50: "#fdf2f8",
          100: "#fce7f3",
          200: "#fbcfe8",
          300: "#f9a8d4",
          400: "#f472b6",
          500: "#ec4899",
          600: "#db2777",
          700: "#be185d",
          800: "#9d174d",
          900: "#831843",
        },
        purpleglow: {
          50: "#faf5ff",
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
          500: "#a855f7",
          600: "#9333ea",
          700: "#7e22ce",
          800: "#6b21a8",
          900: "#581c87",
        },
        darkbg: {
          900: "#0d0614",
          800: "#170a24",
          700: "#220f35",
          600: "#2f1647",
        }
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "beauty-gradient": "linear-gradient(135deg, #ec4899 0%, #d946ef 50%, #8b5cf6 100%)",
        "beauty-glow": "linear-gradient(135deg, rgba(236, 72, 153, 0.15) 0%, rgba(217, 70, 239, 0.15) 50%, rgba(139, 92, 246, 0.15) 100%)",
      },
      boxShadow: {
        "glow-pink": "0 0 25px -5px rgba(236, 72, 153, 0.35)",
        "glow-purple": "0 0 25px -5px rgba(168, 85, 247, 0.35)",
        "glass": "0 8px 32px 0 rgba(190, 24, 93, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
