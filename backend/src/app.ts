import dotenv from "dotenv";
import { mkdirSync } from "fs";
import express, {
  json,
  type NextFunction,
  type Request,
  type Response,
  static as expressStatic,
} from "express";
import { connect } from "mongoose";
import multer, { diskStorage, type FileFilterCallback } from "multer";
import { v4 as uuidv4 } from "uuid";
import { graphqlHTTP } from "express-graphql";
import { HttpError } from "./types/http-error";
import { imagesDir } from "./util/path";
import graphqlSchema from "./graphql/schema";
import { createUser } from "./graphql/resolvers";
import auth from "./middleware/auth";
import { clearImage } from "./util/file";

dotenv.config();

const {
  MONGODB_USER,
  MONGODB_PASSWORD,
  MONGODB_HOST,
  MONGODB_DATABASE,
  PORT = "8080",
} = process.env;

if (!MONGODB_USER || !MONGODB_PASSWORD || !MONGODB_HOST || !MONGODB_DATABASE) {
  throw new Error("Missing MongoDB environment variables");
}

const app = express();
const MONGO_URI = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}/${MONGODB_DATABASE}?retryWrites=true&w=majority`;

mkdirSync(imagesDir, { recursive: true });

const fileStorage = diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, imagesDir);
  },
  filename: (_req, file, cb) => {
    cb(null, uuidv4() + "-" + file.originalname);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowed = ["image/png", "image/jpg", "image/jpeg"];
  cb(null, allowed.includes(file.mimetype));
};

app.use(json());
app.use(multer({ storage: fileStorage, fileFilter }).single("image"));

app.use("/images", expressStatic(imagesDir));

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(auth);

app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    throw new Error("Not authenticated!");
  }
  if (!req.file) {
    return res.status(200).json({ message: "No file provided!" });
  }
  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }
  return res
    .status(201)
    .json({ message: "File stored.", filePath: req.file.path });
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: createUser,
    graphiql: true,
    formatError(err) {
      if (!err.originalError) {
        return err;
      }
      const originalError = err.originalError as HttpError;
      const data = originalError.data;
      const message = err.message || "An error occurred.";
      const status = originalError.statusCode || 500;
      return {
        message,
        status,
        data,
      };
    },
  }),
);

app.use(
  (error: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    const status = error.statusCode ?? 500;
    const message = error.message || "Unexpected error";
    const data = error.data;
    console.error(error);
    res.status(status).json({ message, data });
  },
);

async function startServer() {
  try {
    await connect(MONGO_URI);
    console.log("MongoDB connected");
    app.listen(Number(PORT), () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

startServer();
