import { hash, compare } from "bcryptjs";
import { isEmail, isEmpty, isLength } from "validator";
import { sign } from "jsonwebtoken";
import { Request } from "express";
import User from "../models/user";
import Post from "../models/post";
import { clearImage } from "../util/file";

interface UserResponse {
  _id: string;
  email: string;
  name: string;
  status: string;
  posts: string[];
}

interface PostResponse {
  _id: string;
  title: string;
  content: string;
  imageUrl: string;
  creator: UserResponse | string;
  createdAt: string;
  updatedAt: string;
}

interface UserInputData {
  email: string;
  name: string;
  password: string;
}

interface PostInputData {
  title: string;
  content: string;
  imageUrl: string;
}

interface CreateUserArgs {
  userInput: UserInputData;
}

interface CreatePostArgs {
  postInput: PostInputData;
}

interface UpdatePostArgs {
  id: string;
  postInput: PostInputData;
}

interface DeletePostArgs {
  id: string;
}

interface LoginArgs {
  email: string;
  password: string;
}

interface PostsArgs {
  page?: number;
}

interface PostArgs {
  id: string;
}

interface UpdateStatusArgs {
  status: string;
}

interface AuthData {
  token: string;
  userId: string;
}

export async function createUser(
  { userInput }: CreateUserArgs,
  _req: Request,
): Promise<UserResponse> {
  const errors: { message: string }[] = [];

  if (!isEmail(userInput.email)) {
    errors.push({ message: "E-Mail is invalid." });
  }

  if (
    isEmpty(userInput.password) ||
    !isLength(userInput.password, { min: 5 })
  ) {
    errors.push({ message: "Password too short!" });
  }

  if (errors.length > 0) {
    const error: any = new Error("Invalid input.");
    error.code = 422;
    error.data = errors;
    throw error;
  }

  const existingUser = await User.findOne({ email: userInput.email });
  if (existingUser) {
    const error: any = new Error("User exists already!");
    error.code = 409;
    throw error;
  }

  const hashedPw = await hash(userInput.password, 12);

  const user = await User.create({
    email: userInput.email,
    name: userInput.name,
    password: hashedPw,
  });

  return {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    status: user.status,
    posts: [],
  };
}

export async function login({ email, password }: LoginArgs): Promise<AuthData> {
  const user = await User.findOne({ email });
  if (!user) {
    const error: any = new Error("User not found.");
    error.code = 401;
    throw error;
  }

  const isEqual = await compare(password, user.password);
  if (!isEqual) {
    const error: any = new Error("Password is incorrect.");
    error.code = 401;
    throw error;
  }

  const token = sign(
    { userId: user._id.toString(), email: user.email },
    process.env.JWT_SECRET || "somesupersecretsecret",
    { expiresIn: "1h" },
  );

  return { token, userId: user._id.toString() };
}

export async function createPost(
  { postInput }: CreatePostArgs,
  req: Request,
): Promise<PostResponse> {
  if (!req.isAuth || !req.userId) {
    const error: any = new Error("Not authenticated!");
    error.code = 401;
    throw error;
  }

  if (
    isEmpty(postInput.title) ||
    !isLength(postInput.title, { min: 5 }) ||
    isEmpty(postInput.content) ||
    !isLength(postInput.content, { min: 5 })
  ) {
    const error: any = new Error("Invalid input.");
    error.code = 422;
    throw error;
  }

  const user = await User.findById(req.userId);
  if (!user) {
    const error: any = new Error("Invalid user.");
    error.code = 401;
    throw error;
  }

  const post = await Post.create({
    title: postInput.title,
    content: postInput.content,
    imageUrl: postInput.imageUrl,
    creator: user._id,
  });

  user.posts.push(post._id);
  await user.save();

  return {
    _id: post._id.toString(),
    title: post.title,
    content: post.content,
    imageUrl: post.imageUrl,
    creator: {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      status: user.status,
      posts: user.posts.map((p) => p.toString()),
    },
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export async function posts(
  { page = 1 }: PostsArgs,
  req: Request,
): Promise<{ posts: PostResponse[]; totalPosts: number }> {
  if (!req.isAuth) {
    const error: any = new Error("Not authenticated!");
    error.code = 401;
    throw error;
  }

  const perPage = 2;

  const totalPosts = await Post.countDocuments();
  const fetchedPosts = await Post.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * perPage)
    .limit(perPage)
    .populate("creator");

  return {
    posts: fetchedPosts.map((p: any) => ({
      _id: p._id.toString(),
      title: p.title,
      content: p.content,
      imageUrl: p.imageUrl,
      creator: {
        _id: p.creator._id.toString(),
        email: p.creator.email,
        name: p.creator.name,
        status: p.creator.status,
        posts: p.creator.posts.map((id: any) => id.toString()),
      },
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
    totalPosts,
  };
}

export async function deletePost(
  { id }: DeletePostArgs,
  req: Request,
): Promise<boolean> {
  if (!req.isAuth || !req.userId) {
    const error: any = new Error("Not authenticated!");
    error.code = 401;
    throw error;
  }

  const post = await Post.findById(id);
  if (!post) {
    const error: any = new Error("No post found!");
    error.code = 404;
    throw error;
  }

  if (post.creator.toString() !== req.userId.toString()) {
    const error: any = new Error("Not authorized!");
    error.code = 403;
    throw error;
  }

  clearImage(post.imageUrl);
  await Post.findByIdAndDelete(id);

  const user = await User.findById(req.userId);
  if (user) {
    user.posts.pull(id);
    await user.save();
  }

  return true;
}

export async function user(
  _args: unknown,
  req: Request,
): Promise<UserResponse> {
  if (!req.isAuth || !req.userId) {
    const error: any = new Error("Not authenticated!");
    error.code = 401;
    throw error;
  }

  const user = await User.findById(req.userId);
  if (!user) {
    const error: any = new Error("No user found!");
    error.code = 404;
    throw error;
  }

  return {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    status: user.status,
    posts: user.posts.map((p) => p.toString()),
  };
}

export async function updateStatus(
  { status }: UpdateStatusArgs,
  req: Request,
): Promise<UserResponse> {
  if (!req.isAuth || !req.userId) {
    const error: any = new Error("Not authenticated!");
    error.code = 401;
    throw error;
  }

  const user = await User.findById(req.userId);
  if (!user) {
    const error: any = new Error("No user found!");
    error.code = 404;
    throw error;
  }

  user.status = status;
  await user.save();

  return {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    status: user.status,
    posts: user.posts.map((p) => p.toString()),
  };
}
