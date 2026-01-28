import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import { Types } from "mongoose";

interface AuthTokenPayload {
  userId: string;
}

dotenv.config();

const { JWT_SECRET } = process.env;

if (!JWT_SECRET) {
  throw new Error("Missing JWT secret");
}

export default (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    req.isAuth = false;
    return next();
  }

  const token = authHeader.split(" ")[1];

  let decodedToken: AuthTokenPayload;

  try {
    decodedToken = verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    req.isAuth = false;
    return next();
  }

  if (!decodedToken?.userId) {
    req.isAuth = false;
    return next();
  }

  req.userId = new Types.ObjectId(decodedToken.userId);
  req.isAuth = true;
  next();
};
