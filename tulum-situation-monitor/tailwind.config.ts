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
        accent: {
          cyan: "#00d4ff",
          yellow: "#ffd600",
          green: "#00d46a",
          red: "#ff3b30",
          purple: "#af52de",
          grey: "#a0a0a0",
        },
        bg: {
          dark: "#0a0a0a",
          panel: "rgba(10, 10, 10, 0.95)",
        },
        border: "#333",
        "text-muted": "#888",
      },
    },
  },
  plugins: [],
};

export default config;
