import { Router } from "express";
import { body } from "express-validator";
import { createPost, getPost, getPosts } from "../controllers/feed";

const router = Router();

// GET /feed/posts
router.get("/posts", getPosts);

// POST /feed/post
router.post(
  "/post",
  [
    body("title").trim().isLength({ min: 7 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  createPost,
);

// GET /feed/post/:postId
router.get("/post/:postId", getPost);

export default router;
