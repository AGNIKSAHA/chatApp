import { IUser, UserResponse } from "./user.types";

export const sanitizeUser = (user: IUser): UserResponse => {
  return {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    isOnline: user.isOnline,
    lastSeen: user.lastSeen,
  };
};

export const sanitizeUsers = (users: IUser[]): UserResponse[] => {
  return users.map(sanitizeUser);
};
