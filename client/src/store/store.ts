import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import chatReducer from "./slices/chatSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["chat/addMessage"],
        // Ignore these field paths in all actions
        ignoredActionPaths: ["payload.createdAt", "payload.lastSeen"],
        ignoredPaths: ["chat.messages"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
