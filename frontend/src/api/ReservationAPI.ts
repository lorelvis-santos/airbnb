import api from "../lib/axios";
import type { BackendResponse } from "../types/api.types";
import type {
  CreateReservation,
  ReservationResponse,
} from "../schemas/reservation.schema";

export const ReservationAPI = {
  create: async (
    data: CreateReservation,
  ): Promise<BackendResponse<ReservationResponse>> => {
    const response = await api.post<BackendResponse<ReservationResponse>>(
      "/reservations",
      data,
    );
    return response.data;
  },
};
