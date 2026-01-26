import dotenv from "dotenv";
import { resolve } from "path";
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
import feedRoutes from "./routes/feed";

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
const UPLOAD_DIR = resolve(process.cwd(), "images");
mkdirSync(UPLOAD_DIR, { recursive: true });

type HttpError = Error & { statusCode?: number };

const fileStorage = diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
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

app.use("/images", expressStatic(UPLOAD_DIR));

app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

app.use(
  (error: HttpError, _req: Request, res: Response, _next: NextFunction) => {
    const status = error.statusCode ?? 500;
    const message = error.message || "Unexpected error";
    console.error(error);
    res.status(status).json({ message });
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
