import { z } from "zod";

export const notificationSchema = z.object({
  id: z.uuidv4(),
  userId: z.uuidv4(),
  message: z.string(),
  status: z.string(), // "Unread" o "Read"
  createdAt: z.string(),
});

export type Notification = z.infer<typeof notificationSchema>;
