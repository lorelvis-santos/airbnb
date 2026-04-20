import { Search, MapPin, Calendar, Users } from "lucide-react";
import { useProperties } from "../../hooks/properties/useQueries";
import PropertyCard from "./components/PropertyCard";

export default function Home() {
  // Consumimos la API usando nuestro Hook. Pedimos la primera página con 12 elementos.
  const { data: response, isLoading } = useProperties(1, 12);
  const properties = response?.data.items || [];

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

          {/* Buscador: Adaptable a móvil (Columna) y Escritorio (Fila) */}
          <div className="mx-auto mt-10 max-w-4xl flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-3xl sm:rounded-full bg-white p-4 sm:p-2 shadow-xl border border-gray-100 gap-2 sm:gap-0">
            {/* Ubicación */}
            <div className="flex flex-1 items-center px-4 py-3 sm:py-2 hover:bg-gray-50 rounded-2xl sm:rounded-full transition cursor-pointer">
              <MapPin className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-900">Dónde</p>
                <input
                  type="text"
                  placeholder="Explorar destinos"
                  className="block w-full border-0 p-0 text-gray-600 placeholder-gray-400 focus:ring-0 sm:text-sm bg-transparent outline-none"
                />
              </div>
            </div>

            {/* Separador Vertical (Escritorio) / Horizontal (Móvil) */}
            <div className="hidden h-8 w-px bg-gray-200 sm:block"></div>
            <div className="h-px w-full bg-gray-100 sm:hidden border-none my-1"></div>

            {/* Fechas */}
            <div className="flex flex-1 items-center px-4 py-3 sm:py-2 hover:bg-gray-50 rounded-2xl sm:rounded-full transition cursor-pointer">
              <Calendar className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-900">Fechas</p>
                <p className="text-sm text-gray-400">Añade fechas</p>
              </div>
            </div>

            {/* Separador Vertical (Escritorio) / Horizontal (Móvil) */}
            <div className="hidden h-8 w-px bg-gray-200 sm:block"></div>
            <div className="h-px w-full bg-gray-100 sm:hidden border-none my-1"></div>

            {/* Huéspedes */}
            <div className="flex flex-1 items-center px-4 py-3 sm:py-2 hover:bg-gray-50 rounded-2xl sm:rounded-full transition cursor-pointer">
              <Users className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
              <div className="text-left w-full">
                <p className="text-xs font-bold text-gray-900">Quién</p>
                <p className="text-sm text-gray-400">¿Cuántos?</p>
              </div>
            </div>

            {/* Botón Buscar */}
            <div className="mt-2 sm:mt-0 sm:ml-4">
              <button className="flex w-full sm:w-auto items-center justify-center rounded-2xl sm:rounded-full bg-blue-600 px-8 py-4 sm:py-3 text-white hover:bg-blue-500 transition-colors shadow-md">
                <Search className="h-5 w-5 mr-2" />
                <span className="font-bold">Buscar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECCIÓN DE RESULTADOS / CATÁLOGO --- */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-left mb-6">
          Explorar propiedades
        </h2>

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
          <div className="py-12 text-center text-gray-500">
            <p className="text-lg">
              No se encontraron propiedades en este momento.
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
