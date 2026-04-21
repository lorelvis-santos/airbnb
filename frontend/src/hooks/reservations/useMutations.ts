import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ReservationAPI } from "../../api/ReservationAPI";
import type { CreateReservation } from "../../schemas/reservation.schema";

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
