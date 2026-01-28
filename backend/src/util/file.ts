import { join } from "path";
import { unlink } from "fs";

export const clearImage = (filePath: string) => {
  filePath = join(__dirname, "..", filePath);
  unlink(filePath, (err) => console.log(err));
};
