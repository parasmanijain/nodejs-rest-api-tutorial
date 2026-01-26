import { validationResult } from "express-validator";
import type { NextFunction, Request, Response } from "express";
import Post from "../models/post";

type HttpError = Error & { statusCode?: number };

export const getPosts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const posts = await Post.find().exec();
    res.status(200).json({ message: "Fetched posts successfully.", posts });
  } catch (err) {
    const error = err as HttpError;
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

export const createPost = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: HttpError = new Error(
        "Validation failed, entered data is incorrect.",
      );
      error.statusCode = 422;
      throw error;
    }
    if (!req.file) {
      const error: HttpError = new Error("No image provided.");
      error.statusCode = 422;
      throw error;
    }

    const imageUrl = req.file.path;
    const title = String(req.body.title);
    const content = String(req.body.content);

    const post = new Post({
      title,
      content,
      imageUrl,
      creator: { name: "Maximilian" },
    });

    const result = await post.save();
    res
      .status(201)
      .json({ message: "Post created successfully!", post: result });
  } catch (err) {
    const error = err as HttpError;
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

export const getPost = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId).exec();
    if (!post) {
      const error: HttpError = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "Post fetched.", post });
  } catch (err) {
    const error = err as HttpError;
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};
