import { useMutation } from "@tanstack/react-query";
import { UserAPI } from "../../api/UserAPI";

export const useBecomeHost = () => {
  return useMutation({
    mutationFn: UserAPI.becomeHost,
  });
};
