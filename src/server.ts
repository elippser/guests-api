import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import { connectDB } from "./config/dbCon";
import routes from "./routes";
import { logger } from "./logger";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use(routes);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
}

app.use((err: ErrorWithStatusCode, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error("Unhandled error", { error: err.message, stack: err.stack });
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || "Internal server error",
  });
});

export function createHttpServer() {
  return createServer(app);
}

export default app;
