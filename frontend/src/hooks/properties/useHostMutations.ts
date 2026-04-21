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
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", variables.id] });
    },
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: PropertyAPI.deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};

export const useUploadImages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, files }: { id: string; files: File[] }) =>
      PropertyAPI.uploadImages(id, files),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["property", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    },
  });
};

export const useDeleteImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId,
      imageId,
    }: {
      propertyId: string;
      imageId: string;
    }) => PropertyAPI.deleteImage(propertyId, imageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["property", variables.propertyId],
      });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["my-properties"] });
    },
  });
};

// --- NUEVAS MUTACIONES PARA EL CALENDARIO ---

export const useBlockDates = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { startDate: string; endDate: string };
    }) => PropertyAPI.blockDates(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["property", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};

export const useUnblockDates = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      propertyId,
      blockId,
    }: {
      propertyId: string;
      blockId: string;
    }) => PropertyAPI.unblockDates(propertyId, blockId),
    onSuccess: (_, variables) => {
      console.log(variables);
      queryClient.invalidateQueries({
        queryKey: ["property", variables.propertyId],
      });
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });
};
