import api from "../lib/axios";
import type {
  LoginFormValues,
  RegisterFormValues,
  AuthResponse,
} from "../schemas/auth.schema";
import type { BackendResponse } from "../types/api.types";

export const AuthAPI = {
  login: async (
    data: LoginFormValues,
  ): Promise<BackendResponse<AuthResponse>> => {
    const response = await api.post<BackendResponse<AuthResponse>>(
      "/auth/login",
      data,
    );
    console.log(response);
    return response.data;
  },

  register: async (
    data: RegisterFormValues,
  ): Promise<BackendResponse<null>> => {
    const response = await api.post<BackendResponse<null>>(
      "/auth/register",
      data,
    );
    return response.data;
  },

  confirmEmail: async (token: string): Promise<BackendResponse<null>> => {
    const encodedToken = encodeURIComponent(token);
    const response = await api.get<BackendResponse<null>>(
      `/auth/confirm?token=${encodedToken}`,
    );
    return response.data;
  },
};
