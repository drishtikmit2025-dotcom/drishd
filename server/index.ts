import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import connectDB from "./config/database";
import authRoutes from "./routes/auth";
import ideasRoutes from "./routes/ideas";
import notificationsRoutes from "./routes/notifications";
import chatRoutes from "./routes/chat";
import usersRoutes from "./routes/users";

export function createServer() {
  const app = express();

  // Connect to database (non-blocking)
  connectDB();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/ideas', ideasRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/chat', chatRoutes);
  app.use('/api/users', usersRoutes);

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "OK",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      mode: process.env.MONGODB_URI ? "full-stack" : "demo-mode"
    });
  });

  return app;
}
