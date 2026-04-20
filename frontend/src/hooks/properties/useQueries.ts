import { useQuery } from "@tanstack/react-query";
import { PropertyAPI } from "../../api/PropertyAPI";

export const useProperties = (pageNumber = 1, pageSize = 12) => {
  return useQuery({
    // El array de dependencias de la caché incluye la paginación
    queryKey: ["properties", pageNumber, pageSize],
    queryFn: () => PropertyAPI.getAll(pageNumber, pageSize),
    staleTime: 1000 * 60 * 10, // Mantenemos los datos frescos por 10 minutos
  });
};
