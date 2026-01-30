import dotenv from "dotenv";
import type { Request, Response, NextFunction } from "express";
import { connect, disconnect, Types } from "mongoose";
import { expect } from "chai";
import sinon from "sinon";
import User from "../models/user";
import { getUserStatus, login } from "../controllers/auth";

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

describe("Auth Controller", () => {
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

  it("should throw an error with code 500 if accessing the database fails", function (done) {
    const stub = sinon.stub(User, "findOne");
    stub.throws();
    const req = {
      body: {
        email: "test@test.com",
        password: "tester",
      },
    } as Request;

    login(
      req,
      {} as Response,
      ((err: unknown) => {
        try {
          expect(err).to.be.an("error");
          expect((err as any).statusCode).to.equal(500);
          done();
        } finally {
          stub.restore();
        }
      }) as NextFunction,
    );
  });

  it("should send a response with a valid user status for an existing user", async function () {
    const req = {
      userId: new Types.ObjectId("5c0f66b979af55031b34728a"),
    } as Request;

    const res = {
      statusCode: 500,
      userStatus: null as null | string,
      status(this: typeof res, code: number) {
        this.statusCode = code;
        return this;
      },
      json(this: typeof res, data: { status: string }) {
        this.userStatus = data.status;
      },
    } as unknown as Response & {
      statusCode: number;
      userStatus: string | null;
    };

    await getUserStatus(req, res, () => {});
    expect(res.statusCode).to.equal(200);
    expect(res.userStatus).to.equal("I am new!");
  });

  after(async function () {
    await User.deleteMany({});
    await disconnect();
  });
});
