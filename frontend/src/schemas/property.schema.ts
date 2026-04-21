import { z } from "zod";

export const hostSimpleSchema = z.object({
  id: z.uuidv4(),
  fullName: z.string(),
});

export const propertyImageSchema = z.object({
  id: z.uuidv4(),
  url: z.string(),
});

export const propertyResponseSchema = z.object({
  id: z.uuidv4(),
  title: z.string(),
  city: z.string(),
  province: z.string(),
  pricePerNight: z.number(),
  capacity: z.number(),
  host: hostSimpleSchema.nullable(),
  images: z.array(propertyImageSchema),
  averageRating: z.number(),
  reviewsCount: z.number(),
});

// 1. Se añade el ID al esquema de bloques
export const propertyBlockSchema = z.object({
  id: z.uuidv4(),
  startDate: z.string(), // Viene como ISO string "2026-05-01T00:00:00"
  endDate: z.string(),
});

// 2. Se extrae el esquema de reservaciones
export const propertyReservationSchema = z.object({
  checkIn: z.string(),
  checkOut: z.string(),
});

export const propertyDetailSchema = z.object({
  id: z.uuidv4(),
  title: z.string(),
  description: z.string().nullable(),
  city: z.string(),
  province: z.string(),
  pricePerNight: z.number(),
  capacity: z.number(),
  host: hostSimpleSchema.nullable(),
  images: z.array(propertyImageSchema),
  blocks: z.array(propertyBlockSchema), // Utiliza el esquema actualizado
  averageRating: z.number(),
  reviewsCount: z.number(),
  reservations: z.array(propertyReservationSchema).optional(), // Utiliza el esquema extraído
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

// 3. Se exportan los tipos requeridos
export type PropertyFormData = z.infer<typeof propertyFormSchema>;
export type PropertyDetail = z.infer<typeof propertyDetailSchema>;
export type Property = z.infer<typeof propertyResponseSchema>;
export type PropertyBlock = z.infer<typeof propertyBlockSchema>;
export type PropertyReservation = z.infer<typeof propertyReservationSchema>;
