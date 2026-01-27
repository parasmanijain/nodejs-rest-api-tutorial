import { join } from "path";

const isProd = process.env.NODE_ENV === "production";

export const imagesDir = isProd
  ? join(__dirname, "images") // dist/images in production
  : join(process.cwd(), "src", "images"); // src/images in development
