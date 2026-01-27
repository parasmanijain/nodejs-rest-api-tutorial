import type { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { unlink } from "fs";
import { basename, join, posix } from "path";
import { HttpError } from "../types/http-error";
import { imagesDir } from "../util/path";
import Post from "../models/post";
import User from "../models/user";

export const getPosts = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const currentPage = Number(req.query.page) || 1;
    const perPage = 2;
    const totalItems = await Post.countDocuments();
    const posts = await Post.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);
    res.status(200).json({
      message: "Fetched posts successfully.",
      posts,
      totalItems,
    });
  } catch (err) {
    const error = err as HttpError;
    error.statusCode ??= 500;
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
      error.data = errors.array();
      throw error;
    }
    if (!req.file) {
      const error: HttpError = new Error("No image provided.");
      error.statusCode = 422;
      throw error;
    }
    if (!req.userId) {
      const error: HttpError = new Error("Not authenticated.");
      error.statusCode = 401;
      throw error;
    }
    const { title, content } = req.body as {
      title: string;
      content: string;
    };
    const imageUrl = posix.join("images", req.file.filename.replace("\\", "/"));
    const post = new Post({
      title,
      content,
      imageUrl,
      creator: req.userId,
    });

    await post.save();
    const user = await User.findById(req.userId);
    if (!user) {
      const error: HttpError = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }
    user.posts.push(post._id);
    await user.save();
    res.status(201).json({
      message: "Post created successfully!",
      post,
      creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    const error = err as HttpError;
    error.statusCode ??= 500;
    next(error);
  }
};

export const getPost = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      const error: HttpError = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "Post fetched.", post });
  } catch (err) {
    const error = err as HttpError;
    error.statusCode ??= 500;
    next(error);
  }
};

export const updatePost = async (
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
    if (!req.userId) {
      const error: HttpError = new Error("Not authenticated.");
      error.statusCode = 401;
      throw error;
    }
    const { title, content } = req.body as {
      title: string;
      content: string;
    };
    let imageUrl: string | undefined = req.body.image;
    if (req.file) {
      imageUrl = posix.join("images", req.file.filename.replace("\\", "/"));
    }

    if (!imageUrl) {
      const error: HttpError = new Error("No file picked.");
      error.statusCode = 422;
      throw error;
    }
    const post = await Post.findById(req.params.postId);
    if (!post) {
      const error: HttpError = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId.toString()) {
      const error: HttpError = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;
    const updatedPost = await post.save();
    res.status(200).json({
      message: "Post updated!",
      post: updatedPost,
    });
  } catch (err) {
    const error = err as HttpError;
    error.statusCode ??= 500;
    next(error);
  }
};

export const deletePost = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.userId) {
      const error: HttpError = new Error("Not authenticated.");
      error.statusCode = 401;
      throw error;
    }
    const post = await Post.findById(req.params.postId);
    if (!post) {
      const error: HttpError = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId.toString()) {
      const error: HttpError = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }
    clearImage(post.imageUrl);
    await Post.findByIdAndDelete(req.params.postId);
    const user = await User.findById(req.userId);
    if (user) {
      user.posts = user.posts.filter(
        (id) => id.toString() !== post._id.toString(),
      );
      await user.save();
    }
    res.status(200).json({ message: "Deleted post." });
  } catch (err) {
    const error = err as HttpError;
    error.statusCode ??= 500;
    next(error);
  }
};

const clearImage = (filePath: string): void => {
  const filename = basename(filePath);
  const absolutePath = join(imagesDir, filename);
  unlink(absolutePath, (err) => {
    if (err) console.error(err);
  });
};
