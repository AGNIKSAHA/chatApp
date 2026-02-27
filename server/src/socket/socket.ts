import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import { verifyAccessToken } from "../app/common/utils/jwt";
import { User } from "../app/modules/user/user.model";
import { Message } from "../app/modules/message/message.model";
import { IUser } from "../app/modules/user/user.types";
import { env } from "../app/common/config/env";
import mongoose from "mongoose";
import { encrypt } from "../app/common/utils/encryption";

interface AuthenticatedSocket extends Socket {
  userId?: mongoose.Types.ObjectId;
}

interface MessageData {
  receiverId: string;
  content: string;
}

interface TypingData {
  receiverId: string;
}

export const initializeSocket = (server: HTTPServer): Server => {
  const io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  // Authentication middleware for Socket.IO
  io.use((socket: AuthenticatedSocket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) {
        console.warn(
          `Socket connection from ${socket.id} failed: No cookies provided`,
        );
        return next(new Error("Authentication error: No cookies provided"));
      }

      // Robust cookie parser
      const cookies = Object.fromEntries(
        cookieHeader.split(";").map((c) => {
          const [key, ...v] = c.split("=");
          return [key.trim(), v.join("=")];
        }),
      );

      const token = cookies["accessToken"];

      if (!token) {
        console.warn(
          `Socket connection from ${socket.id} failed: accessToken cookie not found`,
        );
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = verifyAccessToken(token);
      socket.userId = new mongoose.Types.ObjectId(decoded.userId);
      next();
    } catch (error) {
      console.warn(`Socket connection from ${socket.id} failed: Invalid token`);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", async (socket: AuthenticatedSocket) => {
    console.log(`User connected: ${socket.userId}`);

    if (!socket.userId) {
      socket.disconnect();
      return;
    }

    // Update user online status
    await User.findByIdAndUpdate(socket.userId, { isOnline: true });

    // Join user's personal room
    socket.join(socket.userId.toString());

    // Notify others that user is online
    socket.broadcast.emit("user:online", { userId: socket.userId.toString() });

    // Handle sending messages
    socket.on("message:send", async (data: MessageData) => {
      try {
        if (!socket.userId) {
          socket.emit("error", { message: "Unauthorized" });
          return;
        }

        const { receiverId, content } = data;

        if (!mongoose.Types.ObjectId.isValid(receiverId)) {
          socket.emit("error", { message: "Invalid receiver ID" });
          return;
        }

        if (!content || content.trim().length === 0) {
          socket.emit("error", { message: "Message content is required" });
          return;
        }

        // Create and save message
        const message = new Message({
          sender: socket.userId,
          receiver: new mongoose.Types.ObjectId(receiverId),
          content: encrypt(content.trim()),
        });

        await message.save();

        // Populate sender and receiver info
        await message.populate("sender", "username avatar");
        await message.populate("receiver", "username avatar");

        const populatedSender = message.sender as unknown as IUser;
        const populatedReceiver = message.receiver as unknown as IUser;

        // Send to receiver if they're online
        io.to(receiverId).emit("message:receive", {
          id: message._id.toString(),
          sender: {
            id: populatedSender._id.toString(),
            username: populatedSender.username,
            avatar: populatedSender.avatar,
          },
          receiver: {
            id: populatedReceiver._id.toString(),
            username: populatedReceiver.username,
            avatar: populatedReceiver.avatar,
          },
          content: content.trim(),
          isRead: message.isRead,
          createdAt: message.createdAt,
        });

        // Confirm to sender
        socket.emit("message:sent", {
          id: message._id.toString(),
          sender: {
            id: populatedSender._id.toString(),
            username: populatedSender.username,
            avatar: populatedSender.avatar,
          },
          receiver: {
            id: populatedReceiver._id.toString(),
            username: populatedReceiver.username,
            avatar: populatedReceiver.avatar,
          },
          content: content.trim(),
          isRead: message.isRead,
          createdAt: message.createdAt,
        });
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Handle typing indicator
    socket.on("typing:start", (data: TypingData) => {
      if (!socket.userId) return;

      const { receiverId } = data;
      io.to(receiverId).emit("typing:start", {
        userId: socket.userId.toString(),
      });
    });

    socket.on("typing:stop", (data: TypingData) => {
      if (!socket.userId) return;

      const { receiverId } = data;
      io.to(receiverId).emit("typing:stop", {
        userId: socket.userId.toString(),
      });
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${socket.userId}`);

      if (!socket.userId) return;

      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
      });

      socket.broadcast.emit("user:offline", {
        userId: socket.userId.toString(),
        lastSeen: new Date(),
      });
    });
  });

  return io;
};
