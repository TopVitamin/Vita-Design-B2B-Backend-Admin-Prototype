import type { Config } from "tailwindcss";
import preset from "../01-页面设计基线/tailwind-preset";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  presets: [preset],
};

export default config;
