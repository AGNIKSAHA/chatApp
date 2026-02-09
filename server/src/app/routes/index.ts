import { Router } from "express";
import userRoutes from "../modules/user/user.routes";
import messageRoutes from "../modules/message/message.routes";

const router = Router();

// Mount module routes
router.use(userRoutes);
router.use(messageRoutes);

// Health check
router.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
