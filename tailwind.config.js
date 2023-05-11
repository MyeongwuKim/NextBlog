/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: ["./pages/**/*.{tsx,ts}", "./components/**/*.{tsx,ts}"],
  darkMode: "class", // Tailwindcss 3.0 default is 'media',  'class'
  theme: {},

  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
