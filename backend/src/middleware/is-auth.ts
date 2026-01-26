import type { Request, Response, NextFunction } from "express";
import { verify, type JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { HttpError } from "../types/http-error";

interface AuthTokenPayload extends JwtPayload {
  userId: string;
}

export default function isAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    const error: HttpError = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }

  const token = authHeader.split(" ")[1];

  let decodedToken: AuthTokenPayload;
  try {
    decodedToken = verify(
      token,
      process.env.JWT_SECRET as string,
    ) as AuthTokenPayload;
  } catch (err) {
    const error = err as HttpError;
    error.statusCode ??= 500;
    throw error;
  }

  if (!decodedToken?.userId) {
    const error: HttpError = new Error("Not authenticated.");
    error.statusCode = 401;
    throw error;
  }

  req.userId = new Types.ObjectId(decodedToken.userId);
  next();
}
