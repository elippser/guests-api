import "dotenv/config";
import path from "path";
import fs from "fs";
import { connectDB } from "./config/dbCon";
import { createHttpServer } from "./server";
import { logger } from "./utils/logs/logger";

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  const logsDir = path.join(process.cwd(), "logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  await connectDB();

  const httpServer = createHttpServer();

  httpServer.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  logger.error("Failed to start server", err);
  process.exit(1);
});
