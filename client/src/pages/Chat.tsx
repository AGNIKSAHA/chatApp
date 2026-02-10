import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks.ts";
import { logout } from "../store/slices/authSlice.ts";
import { clearChat } from "../store/slices/chatSlice.ts";
import { useSocketListeners } from "../hooks/useSocketListeners.ts";
import { disconnectSocket } from "../lib/socket.ts";
import { api } from "../lib/axios.ts";
import Sidebar from "../components/Sidebar.tsx";
import ChatWindow from "../components/ChatWindow.tsx";
import { User } from "../types/index.ts";
import toast from "react-hot-toast";

const Chat: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const selectedUser = useAppSelector((state) => state.chat.selectedUser);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useSocketListeners();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async (): Promise<void> => {
    try {
      const response = await api.get<{ users: User[] }>("/users");
      setUsers(response.data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      disconnectSocket();
      dispatch(logout());
      dispatch(clearChat());
      toast.success("Logged out successfully");
      navigate("/login");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-primary">
      <div className="flex h-full w-full max-w-[1920px] mx-auto overflow-hidden">
        <div
          className={`h-full w-full lg:w-80 ${selectedUser ? "hidden lg:block" : "block"}`}
        >
          <Sidebar users={users} loading={loading} onLogout={handleLogout} />
        </div>
        <main
          className={`flex-1 overflow-hidden h-full ${selectedUser ? "block" : "hidden lg:block"}`}
        >
          <ChatWindow selectedUser={selectedUser} />
        </main>
      </div>
    </div>
  );
};

export default Chat;
