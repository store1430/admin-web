export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        clinic: {
          teal: "#0f766e",
          mint: "#ccfbf1",
          ink: "#102a2a"
        }
      },
      boxShadow: {
        soft: "0 20px 60px rgba(15, 118, 110, 0.12)"
      }
    }
  },
  plugins: []
};
