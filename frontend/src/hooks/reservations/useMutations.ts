import { useMutation } from "@tanstack/react-query";
import { ReservationAPI } from "../../api/ReservationAPI";
import type { CreateReservation } from "../../schemas/reservation.schema";

export const useCreateReservation = () => {
  return useMutation({
    mutationFn: (data: CreateReservation) => ReservationAPI.create(data),
  });
};
