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

export type RegisterFormValues = z.infer<typeof registerSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;

export type AuthResponse = {
  userId: string;
  fullName: string;
  email: string;
  token: string;
  roles: string[];
};
