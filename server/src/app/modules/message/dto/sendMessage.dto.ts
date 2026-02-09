import { z } from "zod";

export const sendMessageSchema = z.object({
  receiverId: z.string().min(1, "Receiver ID is required"),
  content: z
    .string()
    .min(1, "Message content is required")
    .max(5000, "Message is too long"),
});

export type SendMessageDto = z.infer<typeof sendMessageSchema>;
