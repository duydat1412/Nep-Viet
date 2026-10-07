import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Stitch Heritage Editorial Design System
        "surface": "#fff8f5",
        "surface-bright": "#fff8f5",
        "surface-dim": "#e9d7c8",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#fff1e8",
        "surface-container": "#feeadc",
        "surface-container-high": "#f8e5d6",
        "surface-container-highest": "#f2dfd1",
        "on-surface": "#231a11",
        "on-surface-variant": "#59413e",
        "primary": "#931d16",
        "on-primary": "#ffffff",
        "primary-container": "#b5362b",
        "on-primary-container": "#ffd8d3",
        "primary-fixed": "#ffdad5",
        "on-primary-fixed": "#410001",
        "secondary": "#7e5700",
        "on-secondary": "#ffffff",
        "secondary-container": "#fdc668",
        "on-secondary-container": "#765100",
        "secondary-fixed": "#ffdead",
        "on-secondary-fixed": "#281900",
        "tertiary": "#2e4d74",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#47658e",
        "on-tertiary-container": "#d1e2ff",
        "outline": "#8c716d",
        "outline-variant": "#e0bfba",

        // Nếp Việt Legacy tokens
        nep: {
          paper: "#F6EFE0",
          ink: "#2B2118",
          red: "#B5362B",
          gold: "#C8963E",
          indigo: "#26466D",
          lotus: "#E8909C",
          badge: {
            green: "#2E7D32",
            yellow: "#F57F17",
            red: "#C62828",
            gray: "#616161",
          },
        },
      },
      fontFamily: {
        heading: ["var(--font-lora)", "Playfair Display", "serif"],
        body: ["var(--font-be-vietnam-pro)", "Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
