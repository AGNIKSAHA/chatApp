import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { api } from "../../lib/axios.ts";
import { Message } from "../../types/index.ts";
import { useAppDispatch } from "../../store/hooks.ts";
import { setMessages } from "../../store/slices/chatSlice.ts";

// Get messages for a specific user
export const useMessages = (userId: string | undefined) => {
  const dispatch = useAppDispatch();

  const query = useQuery({
    queryKey: ["messages", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await api.get<{ messages: Message[] }>(
        `/messages/${userId}`,
      );
      return response.data.messages;
    },
    enabled: !!userId,
  });

  // Sync with Redux store when data changes
  useEffect(() => {
    if (query.data && userId) {
      dispatch(setMessages({ userId, messages: query.data }));
    }
  }, [query.data, userId, dispatch]);

  return query;
};

// Mark messages as read
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await api.put(`/messages/${userId}/read`);
    },
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["messages", userId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });
};

// Get conversations
export const useConversations = () => {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await api.get("/conversations");
      return response.data.conversations;
    },
  });
};
