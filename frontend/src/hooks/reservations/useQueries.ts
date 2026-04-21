import { useQuery } from "@tanstack/react-query";
import { ReservationAPI } from "../../api/ReservationAPI";

export const useMyReservations = () => {
  return useQuery({
    queryKey: ["my-reservations"],
    queryFn: ReservationAPI.getMyReservations,
  });
};

export const useHostPropertyReservations = (propertyId: string) => {
  return useQuery({
    queryKey: ["host-reservations", propertyId],
    queryFn: () => ReservationAPI.getPropertyReservations(propertyId),
    enabled: !!propertyId,
  });
};
