import React from "react";
import { LogOut, MessageSquare, Search } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../store/hooks.ts";
import { setSelectedUser } from "../store/slices/chatSlice.ts";
import { User } from "../types";

interface SidebarProps {
  users: User[];
  loading: boolean;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ users, loading, onLogout }) => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const selectedUser = useAppSelector((state) => state.chat.selectedUser);
  const onlineUsers = useAppSelector((state) => state.chat.onlineUsers);

  const getInitials = (username: string): string => {
    return username.substring(0, 2).toUpperCase();
  };

  const isUserOnline = (userId: string): boolean => {
    return onlineUsers.includes(userId);
  };

  return (
    <div className="flex h-screen w-full flex-col border-r border-border-primary bg-bg-secondary">
      <div className="border-b border-border-primary p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-lg font-bold text-white shadow-lg">
                {currentUser?.username
                  ? getInitials(currentUser.username)
                  : "??"}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-bg-secondary bg-success"></div>
            </div>
            <div className="flex flex-col">
              <span className="max-w-[120px] truncate text-sm font-bold text-text-primary">
                {currentUser?.username}
              </span>
              <span className="text-xs text-text-tertiary">Online</span>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="rounded-lg p-2 text-text-tertiary transition-colors hover:bg-bg-hover hover:text-danger"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>

        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search users..."
            className="w-full rounded-lg border border-border-primary bg-bg-tertiary py-2 pl-10 pr-4 text-sm text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar">
        <div className="mb-4 flex items-center justify-between px-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
          <span className="flex items-center gap-2">
            <MessageSquare size={14} />
            Messages
          </span>
          <span className="rounded-full bg-bg-tertiary px-2 py-0.5">
            {users.length}
          </span>
        </div>

        {loading ? (
          <div className="space-y-4 p-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-12 w-12 rounded-full bg-bg-tertiary"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded bg-bg-tertiary"></div>
                  <div className="h-3 w-16 rounded bg-bg-tertiary"></div>
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="mt-20 flex flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-bg-tertiary p-4 text-text-tertiary">
              <Search size={32} />
            </div>
            <p className="text-sm text-text-secondary">No users found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {users.map((user) => (
              <div
                key={user.id}
                className={`group flex cursor-pointer items-center gap-3 rounded-xl p-3 transition-all duration-200 ${
                  selectedUser?.id === user.id
                    ? "bg-primary/10 ring-1 ring-primary/20 shadow-sm"
                    : "hover:bg-bg-hover"
                }`}
                onClick={() => dispatch(setSelectedUser(user))}
              >
                <div className="relative flex-shrink-0">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shadow-md transition-transform duration-200 group-hover:scale-105 ${
                      selectedUser?.id === user.id
                        ? "bg-gradient-to-br from-primary to-primary-dark"
                        : "bg-bg-tertiary text-text-secondary"
                    }`}
                  >
                    {getInitials(user.username)}
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-bg-secondary ${
                      isUserOnline(user.id) ? "bg-success" : "bg-text-tertiary"
                    }`}
                  ></div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <h5
                    className={`truncate text-sm font-semibold transition-colors ${
                      selectedUser?.id === user.id
                        ? "text-primary"
                        : "text-text-primary group-hover:text-primary"
                    }`}
                  >
                    {user.username}
                  </h5>
                  <p className="truncate text-xs text-text-tertiary">
                    {isUserOnline(user.id) ? (
                      <span className="text-success">Online</span>
                    ) : (
                      "Offline"
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
