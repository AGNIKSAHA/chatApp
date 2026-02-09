import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/axios.ts";
import { useAppDispatch } from "../../store/hooks.ts";
import {
  setCredentials,
  logout as logoutAction,
} from "../../store/slices/authSlice.ts";
import { User } from "../../types/index.ts";

interface SignupData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  user: User;
}

// Signup mutation
export const useSignup = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (data: SignupData) => {
      const response = await api.post<AuthResponse>("/auth/signup", data);
      return response.data;
    },
    onSuccess: (data) => {
      dispatch(
        setCredentials({
          user: data.user,
        }),
      );
    },
  });
};

// Login mutation
export const useLogin = () => {
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await api.post<AuthResponse>("/auth/login", data);
      return response.data;
    },
    onSuccess: (data) => {
      dispatch(
        setCredentials({
          user: data.user,
        }),
      );
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      dispatch(logoutAction());
      queryClient.clear();
    },
  });
};

// Get profile query
export const useProfile = (enabled = true) => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get<{ user: User }>("/auth/profile");
      return response.data.user;
    },
    enabled,
  });
};
