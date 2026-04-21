import { z } from "zod";

export const createReservationSchema = z.object({
  propertyId: z.uuidv4,
  checkIn: z.string(), // Formato ISO
  checkOut: z.string(), // Formato ISO
});

export const reservationResponseSchema = z.object({
  id: z.uuidv4,
  propertyId: z.uuidv4,
  guestId: z.uuidv4,
  checkIn: z.string(),
  checkOut: z.string(),
  totalPrice: z.number(),
  status: z.string(),
  createdAt: z.string(),
});

export type CreateReservation = z.infer<typeof createReservationSchema>;
export type ReservationResponse = z.infer<typeof reservationResponseSchema>;
