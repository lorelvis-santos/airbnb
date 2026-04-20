import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { User } from "../types/auth.types";

export type AuthState = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isHost: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        isHost: false,

        setAuth: (user, token) =>
          set({
            user,
            token,
            isAuthenticated: true,
            isHost: user.roles.includes("Host"),
          }),

        logout: () =>
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isHost: false,
          }),
      }),
      {
        name: "airbnb-auth-storage",
      },
    ),
  ),
);
