import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PropertyAPI } from "../../api/PropertyAPI";
import type { PropertyFormData } from "../../schemas/property.schema";

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PropertyFormData) => PropertyAPI.createProperty(data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["my-properties"] }),
  });
};

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PropertyFormData }) =>
      PropertyAPI.updateProperty(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties", variables.id] });
    },
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: PropertyAPI.deleteProperty,
    onSuccess: () => {
      // Invalida la caché para refrescar la lista instantáneamente
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    },
  });
};
