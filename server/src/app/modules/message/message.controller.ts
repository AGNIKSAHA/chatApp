import { Request, Response } from "express";
import { Message } from "./message.model";
import { IUser } from "../user/user.types";
import mongoose from "mongoose";
import { AppError } from "../../common/middlewares/error.middleware";
import { decrypt } from "../../common/utils/encryption";

export const getMessages = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError(401, "Unauthorized");
  }

  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError(400, "Invalid user ID");
  }

  const messages = await Message.find({
    $or: [
      { sender: req.user.userId, receiver: userId },
      { sender: userId, receiver: req.user.userId },
    ],
  })
    .populate("sender", "username avatar")
    .populate("receiver", "username avatar")
    .sort({ createdAt: 1 });

  const formattedMessages = messages.map((msg) => {
    const sender = msg.sender as unknown as IUser;
    const receiver = msg.receiver as unknown as IUser;

    return {
      id: msg._id.toString(),
      sender: {
        id: sender._id.toString(),
        username: sender.username,
        avatar: sender.avatar,
      },
      receiver: {
        id: receiver._id.toString(),
        username: receiver.username,
        avatar: receiver.avatar,
      },
      content: decrypt(msg.content),
      isRead: msg.isRead,
      createdAt: msg.createdAt,
    };
  });

  res.json({ messages: formattedMessages });
};

export const markAsRead = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError(401, "Unauthorized");
  }

  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError(400, "Invalid user ID");
  }

  await Message.updateMany(
    {
      sender: userId,
      receiver: req.user.userId,
      isRead: false,
    },
    {
      isRead: true,
    },
  );

  res.json({ message: "Messages marked as read" });
};

export const getConversations = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.user) {
    throw new AppError(401, "Unauthorized");
  }

  // Get all users the current user has exchanged messages with
  const messages = await Message.find({
    $or: [{ sender: req.user.userId }, { receiver: req.user.userId }],
  })
    .populate("sender", "username avatar isOnline lastSeen")
    .populate("receiver", "username avatar isOnline lastSeen")
    .sort({ createdAt: -1 });

  // Extract unique users
  const userMap = new Map<
    string,
    {
      user: {
        id: string;
        username: string;
        avatar?: string;
        isOnline: boolean;
        lastSeen: Date;
      };
      lastMessage: {
        content: string;
        createdAt: Date;
        isRead: boolean;
        isSentByMe: boolean;
      };
      unreadCount: number;
    }
  >();

  messages.forEach((msg) => {
    const otherUser = (msg.sender._id.equals(req.user!.userId)
      ? msg.receiver
      : msg.sender) as unknown as IUser;

    const otherUserId = otherUser._id.toString();
    const isSentByMe = msg.sender._id.equals(req.user!.userId);

    if (!userMap.has(otherUserId)) {
      userMap.set(otherUserId, {
        user: {
          id: otherUser._id.toString(),
          username: otherUser.username,
          avatar: otherUser.avatar,
          isOnline: otherUser.isOnline,
          lastSeen: otherUser.lastSeen,
        },
        lastMessage: {
          content: decrypt(msg.content),
          createdAt: msg.createdAt,
          isRead: msg.isRead,
          isSentByMe,
        },
        unreadCount: !isSentByMe && !msg.isRead ? 1 : 0,
      });
    } else {
      const existing = userMap.get(otherUserId)!;
      if (!isSentByMe && !msg.isRead) {
        existing.unreadCount++;
      }
    }
  });

  const conversations = Array.from(userMap.values());

  res.json({ conversations });
};
