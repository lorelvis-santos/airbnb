import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { AuthAPI } from "../../api/AuthAPI";
import { toast } from "react-toastify";
import { useAuthStore } from "../../store/authStore";
import type {
  LoginFormValues,
  RegisterFormValues,
} from "../../schemas/auth.schema";
import type { BackendResponse } from "../../types/api.types";

export const useAuthMutations = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (data: LoginFormValues) => AuthAPI.login(data),
    onSuccess: (response) => {
      const { token, ...userData } = response.data;
      setAuth({ id: userData.userId, ...userData }, token);
      navigate("/");
    },
    onError: (error: AxiosError<BackendResponse<null>>) => {
      const errorMessage =
        error.response?.data?.errors?.[0] ||
        "Error de conexión con el servidor.";

      // Lanzamos el Toast de error
      toast.error(errorMessage);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormValues) => AuthAPI.register(data),
    onSuccess: (_, variables) => {
      toast.success("Cuenta creada. Por favor confirma tu correo.");
      navigate("/check-email", { state: { email: variables.email } });
    },
    onError: (error: AxiosError<BackendResponse<null>>) => {
      const errorMessage =
        error.response?.data?.errors?.[0] || "Error al registrarse.";

      toast.error(errorMessage);
    },
  });

  return {
    loginMutation,
    registerMutation,
  };
};
