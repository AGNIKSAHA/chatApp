import { Router } from "express";
import {
  getMessages,
  markAsRead,
  getConversations,
} from "./message.controller";
import { authMiddleware } from "../../common/middlewares/auth.middleware";
import { catchAsync } from "../../common/middlewares/catch.middleware";

const router = Router();

// All message routes require authentication
router.use(authMiddleware);

router.get("/messages/:userId", catchAsync(getMessages));
router.put("/messages/:userId/read", catchAsync(markAsRead));
router.get("/conversations", catchAsync(getConversations));

export default router;
