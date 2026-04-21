import { z } from "zod";

export const hostSimpleSchema = z.object({
  id: z.uuidv4(),
  fullName: z.string(),
});

export const propertyResponseSchema = z.object({
  id: z.uuidv4(),
  title: z.string(),
  city: z.string(),
  province: z.string(),
  pricePerNight: z.number(),
  capacity: z.number(),
  host: hostSimpleSchema.nullable(),
  images: z.array(z.string()),
  averageRating: z.number(),
  reviewsCount: z.number(),
});

export const propertyBlockSchema = z.object({
  startDate: z.string(), // Viene como ISO string "2026-05-01T00:00:00"
  endDate: z.string(),
});

export const propertyDetailSchema = z.object({
  id: z.uuidv4(),
  title: z.string(),
  description: z.string().nullable(), // Puede que algunas no tengan descripción aún
  city: z.string(),
  province: z.string(),
  pricePerNight: z.number(),
  capacity: z.number(),
  host: hostSimpleSchema.nullable(),
  images: z.array(z.string()),
  blocks: z.array(propertyBlockSchema),
  averageRating: z.number(),
  reviewsCount: z.number(),
  reservations: z
    .array(
      z.object({
        checkIn: z.string(),
        checkOut: z.string(),
      }),
    )
    .optional(),
});

export const propertyFormSchema = z.object({
  title: z.string().min(10, "El título debe tener al menos 10 caracteres"),
  description: z
    .string()
    .min(20, "La descripción debe tener al menos 20 caracteres"),
  city: z.string().min(2, "La ciudad es obligatoria"),
  province: z.string().min(2, "La provincia es obligatoria"),
  pricePerNight: z.number().min(1, "El precio por noche debe ser mayor a 0"),
  capacity: z
    .number()
    .min(1, "La capacidad debe ser de al menos 1 persona")
    .max(50, "Capacidad máxima excedida"),
});

export type PropertyFormData = z.infer<typeof propertyFormSchema>;
export type PropertyDetail = z.infer<typeof propertyDetailSchema>;
export type Property = z.infer<typeof propertyResponseSchema>;
