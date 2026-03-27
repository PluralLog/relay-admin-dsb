/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          deep: "#1A1B20",
          main: "#22232A",
          card: "#2A2B33",
          elevated: "#32333D",
        },
        border: {
          DEFAULT: "#3A3B46",
          dim: "#2E2F38",
        },
        txt: {
          primary: "#E8E9ED",
          secondary: "#9A9CA8",
          muted: "#6B6D78",
        },
        accent: {
          DEFAULT: "#6E9ECA",
          dim: "rgba(110, 158, 202, 0.12)",
        },
        ok: "#7EC96A",
        warn: "#D4A84B",
        danger: "#D46B6B",
      },
      borderRadius: {
        card: "14px",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
