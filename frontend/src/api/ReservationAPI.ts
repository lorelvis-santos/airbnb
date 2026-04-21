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

  getMyReservations: async (): Promise<
    BackendResponse<ReservationResponse[]>
  > => {
    const response = await api.get<BackendResponse<ReservationResponse[]>>(
      "/reservations/my-reservations",
    );
    return response.data;
  },

  cancel: async (id: string): Promise<BackendResponse<{ message: string }>> => {
    const response = await api.patch<BackendResponse<{ message: string }>>(
      `/reservations/${id}/cancel`,
    );
    return response.data;
  },
};
