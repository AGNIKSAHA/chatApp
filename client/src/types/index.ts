export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
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
  createdAt: Date;
}

export interface Conversation {
  user: {
    id: string;
    username: string;
    avatar?: string;
    isOnline: boolean;
    lastSeen: Date;
  };
  lastMessage: {
    content: string;
    createdAt: Date;
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
