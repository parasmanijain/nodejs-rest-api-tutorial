import { Router } from "express";
import { body } from "express-validator";
import { isAuth } from "../middleware/is-auth";
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  updatePost,
} from "../controllers/feed";

export const feedRouter = Router();

// GET /feed/posts
feedRouter.get("/posts", isAuth, getPosts);

// POST /feed/post
feedRouter.post(
  "/post",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  createPost,
);

// GET /feed/post/:postId
feedRouter.get("/post/:postId", isAuth, getPost);

feedRouter.put(
  "/post/:postId",
  isAuth,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  updatePost,
);

feedRouter.delete("/post/:postId", isAuth, deletePost);
