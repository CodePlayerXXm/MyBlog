/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./.vitepress/**/*.{js,ts,tsx,vue}",
    "./content/**/*.md",
    "./src/**/*.{js,ts,vue,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-headings": "#1a1a22",
            "--tw-prose-code": "#1a1a22",
            "--tw-prose-invert-headings": "#ffffff",
            "--tw-prose-invert-code": "#ffd764",
            "--tw-prose-invert-body": "#e6e9f2",
            "--tw-prose-invert-bold": "#ffffff",
          },
        },
      },
      colors: {
        // 赛博朋克霓虹配色，与 src/styles/theme.css 里的变量保持一致
        neon: {
          cyan: "#fce300",
          magenta: "#ff2e88",
          lime: "#b6ff3c",
          amber: "#ffc44d",
          red: "#ff4d6d",
          indigo: "#7aa2ff",
        },
        "dark-text": "#e6e9f2",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
