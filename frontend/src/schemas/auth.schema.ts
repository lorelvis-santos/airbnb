import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Debe ser un correo válido"),
  password: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres"),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, "El nombre completo debe tener al menos 3 letras"),
  email: z.email("Debe ser un correo válido"),
  password: z.string().min(8, "La contraseña debe tener mínimo 8 caracteres"),
});

export const authResponseSchema = z.object({
  userId: z.uuidv4(),
  fullName: z.string().trim(),
  email: z.email(),
  token: z.string(),
  roles: z.array(z.string()),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
