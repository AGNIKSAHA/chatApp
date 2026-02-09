import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5505";

let socket: Socket | null = null;

export const initializeSocket = (): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    withCredentials: true,
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected");
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
