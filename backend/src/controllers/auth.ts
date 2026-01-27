import dotenv from "dotenv";
import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { HttpError } from "../types/http-error";
import User from "../models/user";

dotenv.config();

const { JWT_SECRET } = process.env;

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: HttpError = new Error("Validation failed.");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }
    const { email, name, password } = req.body as {
      email: string;
      name: string;
      password: string;
    };
    const hashedPw = await hash(password, 12);
    const user = new User({
      email,
      password: hashedPw,
      name,
    });
    const result = await user.save();
    res.status(201).json({
      message: "User created!",
      userId: result._id.toString(),
    });
  } catch (err) {
    const error = err as HttpError;
    error.statusCode ??= 500;
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };
    const user = await User.findOne({ email });
    if (!user) {
      const error: HttpError = new Error(
        "A user with this email could not be found.",
      );
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await compare(password, user.password);
    if (!isEqual) {
      const error: HttpError = new Error("Wrong password!");
      error.statusCode = 401;
      throw error;
    }
    const token = sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      JWT_SECRET as string,
      { expiresIn: "1h" },
    );
    res.status(200).json({
      token,
      userId: user._id.toString(),
    });
  } catch (err) {
    const error = err as HttpError;
    error.statusCode ??= 500;
    next(error);
  }
};

export const getUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await User.findById(req.userId).exec();
    if (!user) {
      const error: HttpError = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ status: user.status });
  } catch (err) {
    const error = err as HttpError;
    error.statusCode ??= 500;
    next(error);
  }
};

export const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { status } = req.body as { status: string };
    const user = await User.findById(req.userId).exec();
    if (!user) {
      const error: HttpError = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    user.status = status;
    await user.save();
    res.status(200).json({ message: "User updated." });
  } catch (err) {
    const error = err as HttpError;
    error.statusCode ??= 500;
    next(error);
  }
};
