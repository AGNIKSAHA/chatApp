import { useEffect } from "react";
import { getSocket } from "../lib/socket";
import {
  requestNotificationPermission,
  showNotification,
} from "../lib/notifications";
import { useAppSelector, useAppDispatch } from "../store/hooks.ts";
import {
  addMessage,
  setUserOnline,
  setTypingUser,
  incrementUnreadCount,
} from "../store/slices/chatSlice.ts";
import { Message } from "../types";

export const useSocketListeners = (): void => {
  const dispatch = useAppDispatch();
  const selectedUser = useAppSelector((state) => state.chat.selectedUser);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user) return;

    // Request notification permission
    requestNotificationPermission();

    // Handle incoming messages
    const handleMessageReceive = (message: Message): void => {
      const otherUserId =
        message.sender.id === user.id ? message.receiver.id : message.sender.id;
      dispatch(addMessage({ userId: otherUserId, message }));

      // Increment unread count if message is from a user who is not selected
      if (message.sender.id !== user.id && selectedUser?.id !== otherUserId) {
        dispatch(incrementUnreadCount(otherUserId));

        // Show browser notification
        showNotification(`New message from ${message.sender.username}`, {
          body: message.content,
          icon: message.sender.avatar || "/favicon.ico",
        });
      }
    };

    // Handle sent message confirmation
    const handleMessageSent = (message: Message): void => {
      const otherUserId = message.receiver.id;
      dispatch(addMessage({ userId: otherUserId, message }));
    };

    // Handle user online status
    const handleUserOnline = ({ userId }: { userId: string }): void => {
      dispatch(setUserOnline({ userId, isOnline: true }));
    };

    // Handle user offline status
    const handleUserOffline = ({
      userId,
    }: {
      userId: string;
      lastSeen: string;
    }): void => {
      dispatch(setUserOnline({ userId, isOnline: false }));
    };

    // Handle typing indicators
    const handleTypingStart = ({ userId }: { userId: string }): void => {
      if (selectedUser && selectedUser.id === userId) {
        dispatch(setTypingUser({ userId, isTyping: true }));
      }
    };

    const handleTypingStop = ({ userId }: { userId: string }): void => {
      dispatch(setTypingUser({ userId, isTyping: false }));
    };

    // Handle errors
    const handleError = ({ message }: { message: string }): void => {
      console.error("Socket error:", message);
    };

    // Register event listeners
    socket.on("message:receive", handleMessageReceive);
    socket.on("message:sent", handleMessageSent);
    socket.on("user:online", handleUserOnline);
    socket.on("user:offline", handleUserOffline);
    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);
    socket.on("error", handleError);

    // Cleanup
    return () => {
      socket.off("message:receive", handleMessageReceive);
      socket.off("message:sent", handleMessageSent);
      socket.off("user:online", handleUserOnline);
      socket.off("user:offline", handleUserOffline);
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
      socket.off("error", handleError);
    };
  }, [dispatch, selectedUser, user]);
};
