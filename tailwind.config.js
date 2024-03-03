/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      container: {
        center: true,
        padding: "2rem",
      },
      backgroundImage: {
        login: "url('./assets/images/background-images/bg-login.jpg')",
      },
    },
  },
  plugins: [],
};
