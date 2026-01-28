import { hash, compare } from "bcryptjs";
import { isEmail, isEmpty, isLength } from "validator";
import { sign } from "jsonwebtoken";
import User from "../models/user";
import Post from "../models/post";
import { clearImage } from "../util/file";

export async function createUser({ userInput }, req) {
  //   const email = args.userInput.email;
  const errors = [];
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
    const error = new Error("Invalid input.");
    error.data = errors;
    error.code = 422;
    throw error;
  }
  const existingUser = await findOne({ email: userInput.email });
  if (existingUser) {
    const error = new Error("User exists already!");
    throw error;
  }
  const hashedPw = await hash(userInput.password, 12);
  const user = new User({
    email: userInput.email,
    name: userInput.name,
    password: hashedPw,
  });
  const createdUser = await user.save();
  return { ...createdUser._doc, _id: createdUser._id.toString() };
}
export async function login({ email, password }) {
  const user = await User.findOne({ email: email });
  if (!user) {
    const error = new Error("User not found.");
    error.code = 401;
    throw error;
  }
  const isEqual = await compare(password, user.password);
  if (!isEqual) {
    const error = new Error("Password is incorrect.");
    error.code = 401;
    throw error;
  }
  const token = sign(
    {
      userId: user._id.toString(),
      email: user.email,
    },
    "somesupersecretsecret",
    { expiresIn: "1h" },
  );
  return { token: token, userId: user._id.toString() };
}
export async function createPost({ postInput }, req) {
  if (!req.isAuth) {
    const error = new Error("Not authenticated!");
    error.code = 401;
    throw error;
  }
  const errors = [];
  if (isEmpty(postInput.title) || !isLength(postInput.title, { min: 5 })) {
    errors.push({ message: "Title is invalid." });
  }
  if (isEmpty(postInput.content) || !isLength(postInput.content, { min: 5 })) {
    errors.push({ message: "Content is invalid." });
  }
  if (errors.length > 0) {
    const error = new Error("Invalid input.");
    error.data = errors;
    error.code = 422;
    throw error;
  }
  const user = await User.findById(req.userId);
  if (!user) {
    const error = new Error("Invalid user.");
    error.code = 401;
    throw error;
  }
  const post = new Post({
    title: postInput.title,
    content: postInput.content,
    imageUrl: postInput.imageUrl,
    creator: user,
  });
  const createdPost = await post.save();
  user.posts.push(createdPost);
  await user.save();
  return {
    ...createdPost._doc,
    _id: createdPost._id.toString(),
    createdAt: createdPost.createdAt.toISOString(),
    updatedAt: createdPost.updatedAt.toISOString(),
  };
}
export async function posts({ page }, req) {
  if (!req.isAuth) {
    const error = new Error("Not authenticated!");
    error.code = 401;
    throw error;
  }
  if (!page) {
    page = 1;
  }
  const perPage = 2;
  const totalPosts = await Post.find().countDocuments();
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * perPage)
    .limit(perPage)
    .populate("creator");
  return {
    posts: posts.map((p) => {
      return {
        ...p._doc,
        _id: p._id.toString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };
    }),
    totalPosts: totalPosts,
  };
}
export async function post({ id }, req) {
  if (!req.isAuth) {
    const error = new Error("Not authenticated!");
    error.code = 401;
    throw error;
  }
  const post = await Post.findById(id).populate("creator");
  if (!post) {
    const error = new Error("No post found!");
    error.code = 404;
    throw error;
  }
  return {
    ...post._doc,
    _id: post._id.toString(),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}
export async function updatePost({ id, postInput }, req) {
  if (!req.isAuth) {
    const error = new Error("Not authenticated!");
    error.code = 401;
    throw error;
  }
  const post = await Post.findById(id).populate("creator");
  if (!post) {
    const error = new Error("No post found!");
    error.code = 404;
    throw error;
  }
  if (post.creator._id.toString() !== req.userId.toString()) {
    const error = new Error("Not authorized!");
    error.code = 403;
    throw error;
  }
  const errors = [];
  if (isEmpty(postInput.title) || !isLength(postInput.title, { min: 5 })) {
    errors.push({ message: "Title is invalid." });
  }
  if (isEmpty(postInput.content) || !isLength(postInput.content, { min: 5 })) {
    errors.push({ message: "Content is invalid." });
  }
  if (errors.length > 0) {
    const error = new Error("Invalid input.");
    error.data = errors;
    error.code = 422;
    throw error;
  }
  post.title = postInput.title;
  post.content = postInput.content;
  if (postInput.imageUrl !== "undefined") {
    post.imageUrl = postInput.imageUrl;
  }
  const updatedPost = await post.save();
  return {
    ...updatedPost._doc,
    _id: updatedPost._id.toString(),
    createdAt: updatedPost.createdAt.toISOString(),
    updatedAt: updatedPost.updatedAt.toISOString(),
  };
}
export async function deletePost({ id }, req) {
  if (!req.isAuth) {
    const error = new Error("Not authenticated!");
    error.code = 401;
    throw error;
  }
  const post = await Post.findById(id);
  if (!post) {
    const error = new Error("No post found!");
    error.code = 404;
    throw error;
  }
  if (post.creator.toString() !== req.userId.toString()) {
    const error = new Error("Not authorized!");
    error.code = 403;
    throw error;
  }
  clearImage(post.imageUrl);
  await Post.findByIdAndDelete(id);
  const user = await User.findById(req.userId);
  user.posts.pull(id);
  await user.save();
  return true;
}
export async function user(args, req) {
  if (!req.isAuth) {
    const error = new Error("Not authenticated!");
    error.code = 401;
    throw error;
  }
  const user = await User.findById(req.userId);
  if (!user) {
    const error = new Error("No user found!");
    error.code = 404;
    throw error;
  }
  return { ...user._doc, _id: user._id.toString() };
}
export async function updateStatus({ status }, req) {
  if (!req.isAuth) {
    const error = new Error("Not authenticated!");
    error.code = 401;
    throw error;
  }
  const user = await User.findById(req.userId);
  if (!user) {
    const error = new Error("No user found!");
    error.code = 404;
    throw error;
  }
  user.status = status;
  await user.save();
  return { ...user._doc, _id: user._id.toString() };
}
