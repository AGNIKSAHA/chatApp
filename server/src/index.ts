import express, { Application, Request, Response } from "express";
import path from "path";
import { createServer } from "http";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { connectDB } from "./app/common/config/db";
import { env } from "./app/common/config/env";
import { initializeSocket } from "./socket/socket";
import { errorHandler } from "./app/common/middlewares/error.middleware";
import routes from "./app/routes";
import { apiRateLimiter } from "./app/common/middlewares/rateLimit.middleware";

const app: Application = express();
app.set("trust proxy", 1);
const server = createServer(app);

// Initialize Socket.IO
initializeSocket(server);

// Middleware
app.use(helmet());
const allowedOrigins = [
  env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        env.NODE_ENV !== "production"
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use("/api", apiRateLimiter, routes);

// Serve frontend in production
if (env.NODE_ENV === "production") {
  const clientPath = path.join(__dirname, "../../client/dist");
  app.use(express.static(clientPath));

  app.get("*", (req: Request, res: Response) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(clientPath, "index.html"));
    } else {
      res.status(404).json({ error: "API route not found" });
    }
  });
} else {
  // 404 handler for development
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Route not found" });
  });
}

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    server.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT}`);
      console.log(`📡 Socket.IO server ready`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
