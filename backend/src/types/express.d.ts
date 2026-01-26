import { Multer } from "multer";
import { UserDocument } from "../../models/user";

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
      isLoggedIn?: boolean;
      file?: Multer.File;
    }
  }
}

export {};
