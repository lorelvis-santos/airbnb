import { useQuery } from "@tanstack/react-query";
import { PropertyAPI } from "../../api/PropertyAPI";

export const useMyProperties = (
  pageNumber: number = 1,
  pageSize: number = 10,
) => {
  return useQuery({
    queryKey: ["my-properties", pageNumber, pageSize], // La caché se separa por página
    queryFn: () => PropertyAPI.getMyProperties(pageNumber, pageSize),
  });
};
