import type { Config } from "tailwindcss";
import preset from "./tailwind-preset";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  presets: [preset],
};

export default config;
