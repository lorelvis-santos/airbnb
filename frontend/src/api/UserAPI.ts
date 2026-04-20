import api from "../lib/axios";
import type { BackendResponse } from "../types/api.types";
import type { User } from "../schemas/user.schema";

export const UserAPI = {
  getMe: async (): Promise<BackendResponse<User>> => {
    const response = await api.get<BackendResponse<User>>("/users/me");
    return response.data;
  },
};
