import { z } from "zod";

export const reviewFormSchema = z.object({
  rating: z.number().min(1, "Debe seleccionar una calificación").max(5),
  comment: z
    .string()
    .min(10, "El comentario debe tener al menos 10 caracteres")
    .max(500, "El comentario es demasiado largo"),
});

export const reviewSchema = z.object({
  id: z.uuidv4(),
  propertyId: z.uuidv4(),
  guestId: z.uuidv4(),
  reservationId: z.uuidv4(),
  rating: z.number(),
  comment: z.string().trim(),
});

export type Review = z.infer<typeof reviewSchema>;
export type ReviewFormData = z.infer<typeof reviewFormSchema>;
