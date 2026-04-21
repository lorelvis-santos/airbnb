import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReservationAPI } from "../../api/ReservationAPI";
import type { CreateReservation } from "../../schemas/reservation.schema";
import type { ReviewFormData } from "../../schemas/review.schema";

export const useCreateReservation = () => {
  return useMutation({
    mutationFn: (data: CreateReservation) => ReservationAPI.create(data),
  });
};

export const useCancelReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ReservationAPI.cancel(id),
    onSuccess: () => {
      // Invalida la caché para que la lista de viajes se recargue automáticamente
      queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
    },
  });
};

export const useCompleteReservation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ReservationAPI.completeReservation(id),
    onSuccess: () => {
      // Invalida las consultas de reservas para Huésped y Anfitrión
      queryClient.invalidateQueries({ queryKey: ["my-trips"] });
      queryClient.invalidateQueries({ queryKey: ["my-reservations"] });
    },
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewFormData }) =>
      ReservationAPI.createReview(id, data),
    onSuccess: () => {
      // Invalida los viajes para actualizar el estado UI (si es necesario) y las propiedades para recalcular el rating
      queryClient.invalidateQueries({ queryKey: ["my-trips"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};
