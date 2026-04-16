import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        sentiment: {
          positive: "#22c55e",
          neutral: "#a3a3a3",
          negative: "#ef4444",
        },
      },
    },
  },
  plugins: [],
};
export default config;
