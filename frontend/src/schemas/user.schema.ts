import z from "zod";

export const userSchema = z.object({
  id: z.uuidv4(),
  fullName: z.string().trim(),
  email: z.email(),
  roles: z.array(z.string()),
});

export type User = z.infer<typeof userSchema>;
