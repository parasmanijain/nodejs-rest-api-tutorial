import { Router } from "express";
import { body } from "express-validator";
import User from "../models/user";
import {
  signup,
  login,
  updateUserStatus,
  getUserStatus,
} from "../controllers/auth";
import { isAuth } from "../middleware/is-auth";

export const authRouter = Router();

authRouter.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom(async (value) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject("E-Mail address already exists!");
        }
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  signup,
);

authRouter.post("/login", login);

authRouter.get("/status", isAuth, getUserStatus);

authRouter.patch(
  "/status",
  isAuth,
  [body("status").trim().not().isEmpty()],
  updateUserStatus,
);
