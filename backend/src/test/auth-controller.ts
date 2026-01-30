import dotenv from "dotenv";
import type { Request, Response, NextFunction } from "express";
import { connect, disconnect, Types } from "mongoose";
import { expect } from "chai";
import sinon from "sinon";
import User from "../models/user";
import { getUserStatus, login } from "../controllers/auth";

dotenv.config();

const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_HOST, MONGODB_DATABASE } =
  process.env;

if (!MONGODB_USER || !MONGODB_PASSWORD || !MONGODB_HOST || !MONGODB_DATABASE) {
  throw new Error("Missing MongoDB environment variables");
}

const MONGO_URI = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}/${MONGODB_DATABASE}?retryWrites=true&w=majority`;

describe("Auth Controller", () => {
  before((done) => {
    connect(MONGO_URI)
      .then(() => {
        const user = new User({
          email: "test@test.com",
          password: "tester",
          name: "Test",
          posts: [],
          _id: new Types.ObjectId("5c0f66b979af55031b34728a"),
        });
        return user.save();
      })
      .then(() => done());
  });

  beforeEach(() => {});

  afterEach(() => {});

  it("should throw an error with code 500 if accessing the database fails", (done) => {
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

  it("should send a response with a valid user status for an existing user", (done) => {
    // Use correct ObjectId type for userId
    const req = {
      userId: new Types.ObjectId("5c0f66b979af55031b34728a"),
    } as Request;

    // Extend the mock response type to include statusCode and userStatus
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

    getUserStatus(req, res, () => {}).then(() => {
      expect(res.statusCode).to.equal(200);
      expect(res.userStatus).to.equal("I am new!");
      done();
    });
  });

  after((done) => {
    User.deleteMany({})
      .then(() => disconnect())
      .then(() => done());
  });
});
