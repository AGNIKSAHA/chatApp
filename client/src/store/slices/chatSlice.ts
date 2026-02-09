import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User, Message } from "../../types/index.ts";

interface ChatState {
  selectedUser: User | null;
  messages: Record<string, Message[]>;
  typingUsers: string[];
  onlineUsers: string[];
}

const initialState: ChatState = {
  selectedUser: null,
  messages: {},
  typingUsers: [],
  onlineUsers: [],
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    setMessages: (
      state,
      action: PayloadAction<{ userId: string; messages: Message[] }>,
    ) => {
      state.messages[action.payload.userId] = action.payload.messages;
    },
    addMessage: (
      state,
      action: PayloadAction<{ userId: string; message: Message }>,
    ) => {
      const { userId, message } = action.payload;
      if (!state.messages[userId]) {
        state.messages[userId] = [];
      }
      state.messages[userId].push(message);
    },
    setTypingUser: (
      state,
      action: PayloadAction<{ userId: string; isTyping: boolean }>,
    ) => {
      const { userId, isTyping } = action.payload;
      if (isTyping) {
        if (!state.typingUsers.includes(userId)) {
          state.typingUsers.push(userId);
        }
      } else {
        state.typingUsers = state.typingUsers.filter(
          (id: string) => id !== userId,
        );
      }
    },
    setUserOnline: (
      state,
      action: PayloadAction<{ userId: string; isOnline: boolean }>,
    ) => {
      const { userId, isOnline } = action.payload;
      if (isOnline) {
        if (!state.onlineUsers.includes(userId)) {
          state.onlineUsers.push(userId);
        }
      } else {
        state.onlineUsers = state.onlineUsers.filter(
          (id: string) => id !== userId,
        );
      }
    },
    setOnlineUsers: (state, action: PayloadAction<string[]>) => {
      state.onlineUsers = action.payload;
    },
    clearChat: (state) => {
      state.selectedUser = null;
      state.messages = {};
      state.typingUsers = [];
      state.onlineUsers = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase("auth/logout", (state) => {
      state.selectedUser = null;
      state.messages = {};
      state.typingUsers = [];
      state.onlineUsers = [];
    });
    builder.addCase("auth/setCredentials", (state) => {
      state.selectedUser = null;
      state.messages = {};
      state.typingUsers = [];
      state.onlineUsers = [];
    });
  },
});

export const {
  setSelectedUser,
  setMessages,
  addMessage,
  setTypingUser,
  setUserOnline,
  setOnlineUsers,
  clearChat,
} = chatSlice.actions;
export default chatSlice.reducer;
