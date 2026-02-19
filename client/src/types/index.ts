export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: string;
}

export interface Message {
  id: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
  };
  receiver: {
    id: string;
    username: string;
    avatar?: string;
  };
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  user: {
    id: string;
    username: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    isRead: boolean;
    isSentByMe: boolean;
  };
  unreadCount: number;
}

export interface AuthResponse {
  message: string;

  user: {
    id: string;
    username: string;
    email: string;
    avatar?: string;
    isOnline?: boolean;
  };
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}
