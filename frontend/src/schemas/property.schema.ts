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

export type Property = z.infer<typeof propertyResponseSchema>;
