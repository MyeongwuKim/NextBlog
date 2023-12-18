/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: ["./pages/**/*.{tsx,ts}", "./components/**/*.{tsx,ts}"],
  darkMode: "class", // Tailwindcss 3.0 default is 'media',  'class'
  theme: {
    screens: {
      md: { max: "960px" },
      web: { min: "960px" },
      sm: { max: "640px" },
    },
  },

  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms")({ strategy: "class" }),
  ],
};
