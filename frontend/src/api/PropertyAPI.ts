import api from "../lib/axios";
import type { BackendResponse, PagedResult } from "../types/api.types";
import type { Property } from "../schemas/property.schema";

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
};
