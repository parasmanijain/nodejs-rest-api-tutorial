import { Multer } from "multer";
import { Types } from "mongoose";
import { UserDocument } from "../../models/user";

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
      isLoggedIn?: boolean;
      file?: Multer.File;
      userId?: Types.ObjectId;
    }
  }
}

export {};
