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

export type PropertyDetail = z.infer<typeof propertyDetailSchema>;
export type Property = z.infer<typeof propertyResponseSchema>;
