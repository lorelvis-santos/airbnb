import api from "../lib/axios";
import type { BackendResponse } from "../types/api.types";
import type { Notification } from "../schemas/notification.schema";

export const NotificationAPI = {
  getAll: async (
    unreadOnly: boolean = false,
  ): Promise<BackendResponse<Notification[]>> => {
    const response = await api.get<BackendResponse<Notification[]>>(
      `/notifications?unreadOnly=${unreadOnly}`,
    );
    return response.data;
  },

  getUnreadCount: async (): Promise<
    BackendResponse<{ unreadCount: number }>
  > => {
    const response = await api.get<BackendResponse<{ unreadCount: number }>>(
      "/notifications/unread-count",
    );
    return response.data;
  },

  markAsRead: async (
    id: string,
  ): Promise<BackendResponse<{ message: string }>> => {
    const response = await api.patch<BackendResponse<{ message: string }>>(
      `/notifications/${id}/read`,
    );
    return response.data;
  },

  markAllAsRead: async (): Promise<BackendResponse<{ message: string }>> => {
    const response = await api.patch<BackendResponse<{ message: string }>>(
      `/notifications/mark-all-read`,
    );
    return response.data;
  },
};
