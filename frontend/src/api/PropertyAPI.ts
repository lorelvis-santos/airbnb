import api from "../lib/axios";
import type { BackendResponse, PagedResult } from "../types/api.types";
import type {
  Property,
  PropertyDetail,
  PropertyFormData,
} from "../schemas/property.schema";

export type SearchFilters = {
  city?: string;
  province?: string;
  startDate?: string;
  endDate?: string;
  capacity?: string | number;
  minPrice?: string | number;
  maxPrice?: string | number;
};

export const PropertyAPI = {
  getAll: async (
    pageNumber = 1,
    pageSize = 12,
  ): Promise<BackendResponse<PagedResult<Property>>> => {
    const response = await api.get<BackendResponse<PagedResult<Property>>>(
      `/properties?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
    return response.data;
  },

  getById: async (id: string): Promise<BackendResponse<PropertyDetail>> => {
    const response = await api.get<BackendResponse<PropertyDetail>>(
      `/properties/${id}`,
    );
    return response.data;
  },

  getMyProperties: async (
    pageNumber: number = 1,
    pageSize: number = 10,
  ): Promise<BackendResponse<PagedResult<Property>>> => {
    const response = await api.get<BackendResponse<PagedResult<Property>>>(
      `/properties/my-properties?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
    return response.data;
  },

  createProperty: async (
    data: PropertyFormData,
  ): Promise<BackendResponse<{ id: string }>> => {
    const response = await api.post<BackendResponse<{ id: string }>>(
      "/properties",
      data,
    );
    return response.data;
  },

  updateProperty: async (
    id: string,
    data: PropertyFormData,
  ): Promise<BackendResponse<null>> => {
    const response = await api.put<BackendResponse<null>>(
      `/properties/${id}`,
      data,
    );
    return response.data;
  },

  deleteProperty: async (id: string): Promise<BackendResponse<null>> => {
    const response = await api.delete<BackendResponse<null>>(
      `/properties/${id}`,
    );
    return response.data;
  },

  uploadImages: async (
    id: string,
    files: File[],
  ): Promise<BackendResponse<{ urls: string[] }>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const response = await api.post<BackendResponse<{ urls: string[] }>>(
      `/properties/${id}/images`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  deleteImage: async (
    propertyId: string,
    imageId: string,
  ): Promise<BackendResponse<null>> => {
    const response = await api.delete<BackendResponse<null>>(
      `/properties/${propertyId}/images/${imageId}`,
    );
    return response.data;
  },

  blockDates: async (
    id: string,
    data: { startDate: string; endDate: string },
  ) => {
    const response = await api.post(`/properties/${id}/blocks`, data);
    return response.data;
  },

  unblockDates: async (propertyId: string, blockId: string) => {
    const response = await api.delete(
      `/properties/${propertyId}/blocks/${blockId}`,
    );
    return response.data;
  },

  // 2. Aplicamos el tipo SearchFilters a los parámetros
  // 3. Tipamos el retorno de la API para asegurar la consistencia de los datos
  searchProperties: async (
    params: SearchFilters,
  ): Promise<BackendResponse<PagedResult<Property>>> => {
    const query = new URLSearchParams();

    // Al usar Object.entries con TypeScript estricto, le decimos que son key-value
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "" && value !== null) {
        query.append(key, value.toString());
      }
    });

    const response = await api.get<BackendResponse<PagedResult<Property>>>(
      `/properties/search?${query.toString()}`,
    );
    return response.data;
  },
};
