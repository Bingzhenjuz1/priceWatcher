import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        muted: "#5e6b76",
        line: "#d9e1e8",
        panel: "#f7f9fb",
        accent: "#157f72",
        danger: "#b42318"
      }
    }
  },
  plugins: []
};

export default config;
