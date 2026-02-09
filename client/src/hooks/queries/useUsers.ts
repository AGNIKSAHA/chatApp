import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/axios.ts";
import { User } from "../../types/index.ts";

// Get all users
export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await api.get<{ users: User[] }>("/users");
      return response.data.users;
    },
  });
};

// Get single user
export const useUser = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await api.get<{ user: User }>(`/users/${userId}`);
      return response.data.user;
    },
    enabled: !!userId,
  });
};
