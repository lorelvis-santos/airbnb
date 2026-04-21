import { useQuery } from "@tanstack/react-query";
import { ReservationAPI } from "../../api/ReservationAPI";

export const useMyReservations = () => {
  return useQuery({
    queryKey: ["my-reservations"],
    queryFn: ReservationAPI.getMyReservations,
  });
};
