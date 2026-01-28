import { join } from "path";
import { unlink } from "fs";
import { imagesDir } from "./path";

export const clearImage = (filePath: string) => {
  const fileName = filePath.replace(/^images\//, "");
  const absolutePath = join(imagesDir, fileName);

  unlink(absolutePath, (err) => {
    if (err) {
      console.error("Failed to delete image:", err.message);
    }
  });
};
