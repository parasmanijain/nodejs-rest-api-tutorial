import type { Request, Response, NextFunction } from "express";
import { expect } from "chai";
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
});
