import type { Request, Response, NextFunction } from "express";
import { expect } from "chai";
import jwt from "jsonwebtoken";
import sinon from "sinon";
import { isAuth } from "../middleware/is-auth";

describe("Auth Middleware", () => {
  it("should throw an error if no authorization header is present", () => {
    const req = {
      get: (_headerName: string) => null,
    } as unknown as Request;

    expect(() =>
      isAuth(req, {} as Response, (() => {}) as NextFunction),
    ).to.throw("Not authenticated.");
  });

  it("should throw an error if the authorization header is only one string", () => {
    const req = {
      get: (_headerName: string) => "xyz",
    } as unknown as Request;

    expect(() =>
      isAuth(req, {} as Response, (() => {}) as NextFunction),
    ).to.throw();
  });

  it("should yield a userId after decoding the token", function () {
    const validObjectId = "507f1f77bcf86cd799439011";
    const req = {
      get: function (_headerName: string) {
        return "Bearer validtoken";
      },
    } as unknown as Request;
    const stub = sinon.stub(jwt, "verify");
    stub.returns({ userId: validObjectId } as any);
    isAuth(req, {} as Response, (() => {}) as NextFunction);
    expect(req).to.have.property("userId");
    expect(req.userId?.toString()).to.equal(validObjectId);
    expect(stub.called).to.be.true;
    stub.restore();
  });

  it("should throw an error if the token cannot be verified", function () {
    const req = {
      get: function (_headerName: string) {
        return "Bearer xyz";
      },
    } as unknown as Request;
    expect(() =>
      isAuth(req, {} as Response, (() => {}) as NextFunction),
    ).to.throw();
  });
});
