import api from "../lib/axios";
import type { BackendResponse } from "../types/api.types";
import type { User } from "../schemas/user.schema";

export const UserAPI = {
  getMe: async (): Promise<BackendResponse<User>> => {
    const response = await api.get<BackendResponse<User>>("/users/me");
    return response.data;
  },
  becomeHost: async (): Promise<BackendResponse<{ message: string }>> => {
    const response =
      await api.post<BackendResponse<{ message: string }>>(
        "/users/become-host",
      );
    return response.data;
  },
};
