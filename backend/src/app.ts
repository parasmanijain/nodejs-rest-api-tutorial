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
import { createServer } from "http";
import { HttpError } from "./types/http-error";
import { init as initSocket } from "./socket";
import { feedRouter } from "./routes/feed";
import { authRouter } from "./routes/auth";
import { imagesDir } from "./util/path";

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

// CHANGE: Ensure imagesDir exists and use it for uploads and static serving
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

// CHANGE: Serve images from imagesDir under /images
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

app.use("/auth", authRouter);
app.use("/feed", feedRouter);

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
    const server = createServer(app);
    const io = initSocket(server);
    io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);
    });
    server.listen(Number(PORT), () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}

startServer();
