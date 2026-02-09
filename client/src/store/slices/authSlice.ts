import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../../types/index.ts";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  isAuthenticated: !!localStorage.getItem("user"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
      }>,
    ) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;

      // Persist user to localStorage
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem("user", JSON.stringify(state.user));
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;

      // Clear localStorage
      localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
