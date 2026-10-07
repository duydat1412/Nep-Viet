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
        heading: ["var(--font-lora)", "serif"],
        body: ["var(--font-be-vietnam-pro)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
