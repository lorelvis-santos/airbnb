import { useState } from "react";
import { Search, MapPin, Calendar, Users, DollarSign } from "lucide-react";
import { useSearchProperties } from "../../hooks/properties/useQueries";
import PropertyCard from "./components/PropertyCard";
import type { Property } from "../../schemas/property.schema";
import type { SearchFilters } from "../../api/PropertyAPI";

export default function Home() {
  const [formValues, setFormValues] = useState<SearchFilters>({
    city: "",
    startDate: "",
    endDate: "",
    capacity: "",
    minPrice: "",
    maxPrice: "",
  });

  // Empezamos con un objeto vacío. El backend al recibir filtros vacíos debe devolver un GetAll normal.
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});

  const { data: response, isLoading } = useSearchProperties(activeFilters);
  const properties: Property[] = response?.data?.items || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    setActiveFilters(formValues);
  };

  const clearFilters = () => {
    setFormValues({
      city: "",
      startDate: "",
      endDate: "",
      capacity: "",
      minPrice: "",
      maxPrice: "",
    });
    setActiveFilters({});
  };

  const today = new Date().toISOString().split("T")[0];
  const hasActiveFilters = Object.values(activeFilters).some(
    (val) => val !== "" && val !== undefined,
  );

  return (
    <div className="bg-white">
      {/* --- HERO SECTION & BUSCADOR --- */}
      <div className="relative bg-gray-900 pb-32 pt-20 sm:pt-24 lg:pt-32">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop"
            alt="Paisaje de cabañas"
            className="h-full w-full object-cover opacity-40"
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Encuentra tu próximo escape
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-xl text-gray-100">
            Descubre cabañas, casas y habitaciones únicas para tu próxima
            aventura.
          </p>

          {/* Buscador Interactivo Ampliado */}
          <div className="mx-auto mt-10 max-w-6xl flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-3xl sm:rounded-full bg-white p-4 sm:p-2 shadow-xl border border-gray-100 gap-2 sm:gap-0">
            {/* Ubicación */}
            <div className="flex flex-1 items-center px-4 py-3 sm:py-2 hover:bg-gray-50 rounded-2xl sm:rounded-full transition">
              <MapPin className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
              <div className="text-left w-full">
                <label
                  htmlFor="city"
                  className="block text-xs font-bold text-gray-900"
                >
                  Dónde
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formValues.city}
                  onChange={handleInputChange}
                  placeholder="Explorar destinos"
                  className="block w-full border-0 p-0 text-gray-600 placeholder-gray-400 focus:ring-0 sm:text-sm bg-transparent outline-none"
                />
              </div>
            </div>

            <div className="hidden h-8 w-px bg-gray-200 sm:block"></div>
            <div className="h-px w-full bg-gray-100 sm:hidden border-none my-1"></div>

            {/* Fechas (Llegada - Salida combinadas visualmente) */}
            <div className="flex flex-[1.5] items-center px-4 py-3 sm:py-2 hover:bg-gray-50 rounded-2xl sm:rounded-full transition">
              <Calendar className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
              <div className="flex w-full gap-2">
                <div className="text-left w-full">
                  <label
                    htmlFor="startDate"
                    className="block text-[10px] uppercase font-bold text-gray-900"
                  >
                    Llegada
                  </label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="date"
                    min={today}
                    value={formValues.startDate}
                    onChange={handleInputChange}
                    className="block w-full border-0 p-0 text-gray-600 focus:ring-0 text-xs sm:text-sm bg-transparent outline-none cursor-pointer"
                  />
                </div>
                <div className="text-left w-full">
                  <label
                    htmlFor="endDate"
                    className="block text-[10px] uppercase font-bold text-gray-900"
                  >
                    Salida
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    min={formValues.startDate || today}
                    value={formValues.endDate}
                    onChange={handleInputChange}
                    className="block w-full border-0 p-0 text-gray-600 focus:ring-0 text-xs sm:text-sm bg-transparent outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="hidden h-8 w-px bg-gray-200 sm:block"></div>
            <div className="h-px w-full bg-gray-100 sm:hidden border-none my-1"></div>

            {/* Huéspedes */}
            <div className="flex flex-[0.7] items-center px-4 py-3 sm:py-2 hover:bg-gray-50 rounded-2xl sm:rounded-full transition">
              <Users className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
              <div className="text-left w-full">
                <label
                  htmlFor="capacity"
                  className="block text-xs font-bold text-gray-900"
                >
                  Quién
                </label>
                <input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  value={formValues.capacity}
                  onChange={handleInputChange}
                  placeholder="Huéspedes"
                  className="block w-full border-0 p-0 text-gray-600 placeholder-gray-400 focus:ring-0 sm:text-sm bg-transparent outline-none"
                />
              </div>
            </div>

            <div className="hidden h-8 w-px bg-gray-200 sm:block"></div>
            <div className="h-px w-full bg-gray-100 sm:hidden border-none my-1"></div>

            {/* Precio Min - Max */}
            <div className="flex flex-[1.2] items-center px-4 py-3 sm:py-2 hover:bg-gray-50 rounded-2xl sm:rounded-full transition">
              <DollarSign className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
              <div className="flex w-full gap-2 items-center">
                <div className="text-left w-full">
                  <label
                    htmlFor="minPrice"
                    className="block text-[10px] uppercase font-bold text-gray-900"
                  >
                    Mín
                  </label>
                  <input
                    id="minPrice"
                    name="minPrice"
                    type="number"
                    min="0"
                    value={formValues.minPrice}
                    onChange={handleInputChange}
                    placeholder="$0"
                    className="block w-full border-0 p-0 text-gray-600 focus:ring-0 text-xs sm:text-sm bg-transparent outline-none"
                  />
                </div>
                <span className="text-gray-300">-</span>
                <div className="text-left w-full">
                  <label
                    htmlFor="maxPrice"
                    className="block text-[10px] uppercase font-bold text-gray-900"
                  >
                    Máx
                  </label>
                  <input
                    id="maxPrice"
                    name="maxPrice"
                    type="number"
                    min="0"
                    value={formValues.maxPrice}
                    onChange={handleInputChange}
                    placeholder="$1000"
                    className="block w-full border-0 p-0 text-gray-600 focus:ring-0 text-xs sm:text-sm bg-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Botón Buscar */}
            <div className="mt-2 sm:mt-0 sm:ml-2">
              <button
                onClick={handleSearch}
                className="flex w-full sm:w-auto items-center justify-center rounded-2xl sm:rounded-full bg-blue-600 px-6 py-4 sm:py-3 text-white hover:bg-blue-700 transition-colors shadow-md"
              >
                <Search className="h-5 w-5 sm:mr-0 lg:mr-2" />
                <span className="font-bold sm:hidden lg:inline">Buscar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN DE RESULTADOS / CATÁLOGO --- */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 text-left">
            {hasActiveFilters
              ? "Resultados de búsqueda"
              : "Explorar propiedades"}
          </h2>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {isLoading ? (
          // Skeletons de carga
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col gap-3">
                <div className="aspect-square rounded-xl bg-gray-200" />
                <div>
                  <div className="flex justify-between mb-2">
                    <div className="h-4 w-1/2 bg-gray-200 rounded" />
                    <div className="h-4 w-12 bg-gray-200 rounded" />
                  </div>
                  <div className="h-3 w-3/4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-1/3 bg-gray-200 rounded mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : properties.length === 0 ? (
          // Estado Vacío
          <div className="py-20 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-4" />
            <p className="text-xl font-bold text-gray-900 mb-2">
              No se encontraron propiedades
            </p>
            <p className="text-sm">
              Intenta cambiar las fechas, el destino o la cantidad de huéspedes.
            </p>
          </div>
        ) : (
          // Tarjetas reales
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 text-left">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
