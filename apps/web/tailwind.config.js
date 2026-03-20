const config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "polybloom-dark": "#0a1019",
        "polybloom-navy-mid": "#111827",
        "polybloom-navy-light": "#1a2332",
        "polybloom-gold": "#c49a3c",
        "polybloom-gold-dim": "#a07d2e",
        "polybloom-gold-bright": "#dbb44c",
        "polybloom-ice": "#7ba7c2",
        "polybloom-ice-dim": "#5a8aa8",
        "polybloom-ice-bright": "#9dc2d8",
        "polybloom-red": "#c44040",
        "polybloom-white": "#e8e4dc",
        "polybloom-white-dim": "#b0a898",
        "polybloom-neon": "#c49a3c",
        "polybloom-accent": "#7ba7c2",
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
