import { Router } from 'express';

import { getPosts, createPost } from '../controllers/feed';

const router = Router();

// GET /feed/posts
router.get('/posts', getPosts);

// POST /feed/post
router.post('/post', createPost);

export default router;