import type { Request, Response, NextFunction } from "express";
import { connect, disconnect, Types } from "mongoose";
import dotenv from "dotenv";
import { expect } from "chai";
import User from "../models/user";
import { createPost } from "../controllers/feed";

dotenv.config();

const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_HOST, MONGODB_TEST_DATABASE } =
  process.env;

if (
  !MONGODB_USER ||
  !MONGODB_PASSWORD ||
  !MONGODB_HOST ||
  !MONGODB_TEST_DATABASE
) {
  throw new Error("Missing MongoDB environment variables");
}

const MONGO_URI = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}/${MONGODB_TEST_DATABASE}?retryWrites=true&w=majority`;

describe("Feed Controller", () => {
  before(async function () {
    await connect(MONGO_URI);
    const user = new User({
      email: "test@test.com",
      password: "tester",
      name: "Test",
      posts: [],
      _id: new Types.ObjectId("5c0f66b979af55031b34728a"),
    });
    await user.save();
  });

  beforeEach(() => {});

  afterEach(() => {});

  it("should add a created post to the posts of the creator", async function () {
    const req = {
      body: {
        title: "Test Post",
        content: "A Test Post",
      },
      file: {
        filename: "test-image.png",
        mimetype: "image/png",
        path: "abc",
      },
      userId: new Types.ObjectId("5c0f66b979af55031b34728a"),
    } as unknown as Request;

    const res = {
      status: function () {
        return this;
      },
      json: function () {},
    } as unknown as Response;

    await createPost(req, res, (() => {}) as NextFunction);
    const user = await User.findById(req.userId);
    expect(user).to.exist;
    expect(user!.posts).to.have.length(1);
  });

  after(async function () {
    await User.deleteMany({});
    await disconnect();
  });
});
