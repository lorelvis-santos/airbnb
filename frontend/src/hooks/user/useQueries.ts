import { useQuery } from "@tanstack/react-query";
import { UserAPI } from "../../api/UserAPI";
import { useAuthStore } from "../../store/authStore";

export const useUser = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ["user-me"],
    queryFn: () => UserAPI.getMe(),
    enabled: isAuthenticated, // Solo se ejecuta si hay una sesión activa
    staleTime: 1000 * 60 * 5, // Cacheamos el perfil por 5 minutos
  });
};
