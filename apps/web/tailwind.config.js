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
        "goldngoose-dark": "#0a1019",
        "goldngoose-navy-mid": "#111827",
        "goldngoose-navy-light": "#1a2332",
        "goldngoose-gold": "#c49a3c",
        "goldngoose-gold-dim": "#a07d2e",
        "goldngoose-gold-bright": "#dbb44c",
        "goldngoose-ice": "#7ba7c2",
        "goldngoose-ice-dim": "#5a8aa8",
        "goldngoose-ice-bright": "#9dc2d8",
        "goldngoose-red": "#c44040",
        "goldngoose-white": "#e8e4dc",
        "goldngoose-white-dim": "#b0a898",
        "goldngoose-neon": "#c49a3c",
        "goldngoose-accent": "#7ba7c2",
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
