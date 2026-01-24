import { NextFunction, Request, Response } from "express";

export const getPosts = (_req: Request, res: Response, _next: NextFunction) => {
  res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "First Post",
        content: "This is the first post!",
        imageUrl: "images/duck.jpg",
        creator: {
          name: "Maximilian",
        },
        createdAt: new Date(),
      },
    ],
  });
};

export const createPost = (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const title = req.body.title;
  const content = req.body.content;
  // Create post in db
  res.status(201).json({
    message: "Post created successfully!",
    post: {
      _id: new Date().toISOString(),
      title: title,
      content: content,
      creator: { name: "Maximilian" },
      createdAt: new Date(),
    },
  });
};
