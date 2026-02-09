import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isSidebarOpen: boolean;
  theme: "light" | "dark";
  notifications: Array<{
    id: string;
    type: "success" | "error" | "info";
    message: string;
  }>;
}

const initialState: UIState = {
  isSidebarOpen: true,
  theme: (localStorage.getItem("theme") as "light" | "dark") || "light",
  notifications: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
    },
    addNotification: (
      state,
      action: PayloadAction<{
        type: "success" | "error" | "info";
        message: string;
      }>,
    ) => {
      state.notifications.push({
        id: Date.now().toString(),
        ...action.payload,
      });
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n: { id: string }) => n.id !== action.payload,
      );
    },
  },
});

export const { toggleSidebar, setTheme, addNotification, removeNotification } =
  uiSlice.actions;
export default uiSlice.reducer;
