const config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "polybloom-dark": "#0a0a0a",
        "polybloom-neon": "#00ff9f",
        "polybloom-accent": "#ff006e",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      spacing: {
        gutter: "1rem",
        panel: "2rem",
      },
    },
  },
  plugins: [],
};

module.exports = config;
