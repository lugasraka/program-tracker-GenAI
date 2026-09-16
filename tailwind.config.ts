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
        gblue: {
          DEFAULT: "#4285F4",
          hover: "#1a73e8",
          dark: "#174ea6",
          tint: "#e8f0fe",
        },
        ggreen: {
          DEFAULT: "#34A853",
          dark: "#188038",
          tint: "#e6f4ea",
        },
        gred: {
          DEFAULT: "#EA4335",
          dark: "#d93025",
          tint: "#fce8e6",
        },
        gyellow: {
          DEFAULT: "#F9AB00",
          dark: "#b26a00",
          tint: "#fef7e0",
        },
        gsurface: "#f8f9f9",
        gink: "#202124",
        gmuted: "#5f6368",
        gborder: "#e0e0e0",
        ggrid: "#e8eaed",
      },
      fontFamily: {
        sans: ["var(--font-roboto)", "Roboto", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
