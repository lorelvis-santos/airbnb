import { useQuery } from "@tanstack/react-query";
import { NotificationAPI } from "../../api/NotificationAPI";

export const useNotifications = (unreadOnly: boolean) => {
  return useQuery({
    queryKey: ["notifications", unreadOnly], // La caché se separa por el filtro
    queryFn: () => NotificationAPI.getAll(unreadOnly),
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ["notifications-count"],
    queryFn: NotificationAPI.getUnreadCount,
    refetchInterval: 1000 * 60 * 5, // Se actualiza solo cada 5 minutos
  });
};
