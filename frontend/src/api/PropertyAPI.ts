import api from "../lib/axios";
import type { BackendResponse, PagedResult } from "../types/api.types";
import type {
  Property,
  PropertyDetail,
  PropertyFormData,
} from "../schemas/property.schema";

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
};
