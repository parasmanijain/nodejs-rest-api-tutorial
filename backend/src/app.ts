import express, { json, NextFunction, Request, Response } from "express";
import feedRoutes from "./routes/feed";

const app = express();

app.use(json());

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

app.listen(8080, () => {
  console.log(`Server running on port 8080`);
});
