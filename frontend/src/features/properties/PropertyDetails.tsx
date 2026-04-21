import { useParams } from "react-router-dom";
import { Star, Share, Heart, Image as ImageIcon } from "lucide-react";
import { useProperty } from "../../hooks/properties/useQueries"; // Ajusta si el nombre de tu archivo es distinto
import BookingWidget from "./components/BookingWidget";

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: response, isLoading, isError } = useProperty(id);
  const property = response?.data;

  const baseUrl =
    import.meta.env.VITE_API_DOMAIN_URL || "http://localhost:5062";

  if (isLoading)
    return (
      <div className="p-20 text-center text-gray-500">
        Cargando alojamiento...
      </div>
    );
  if (isError || !property)
    return (
      <div className="p-20 text-center text-red-500">
        No se pudo cargar la propiedad.
      </div>
    );

  const images = property.images || [];

  // Preparamos 4 "huecos" para la cuadrícula en caso de que haya entre 1 y 4 imágenes
  const sideImageSlots = Array.from({ length: 4 }).map(
    (_, i) => images[i + 1] || null,
  );

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 pb-20">
      {/* --- CABECERA --- */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          {property.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm font-medium">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-current text-gray-900" />
              <span>
                {property.reviewsCount > 0
                  ? property.averageRating?.toFixed(2)
                  : "Nuevo"}
              </span>
            </div>
            <span>·</span>
            <span className="underline cursor-pointer">
              {property.city}, {property.province}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm font-semibold underline">
            <button className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition">
              <Share className="h-4 w-4" /> Compartir
            </button>
            <button className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition">
              <Heart className="h-4 w-4" /> Guardar
            </button>
          </div>
        </div>
      </header>

      {/* --- GALERÍA DE FOTOS DINÁMICA --- */}
      <section className="relative overflow-hidden rounded-xl h-75 sm:h-112.5 bg-gray-100">
        {images.length === 0 ? (
          // CASO 1: 0 Imágenes
          <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
            <ImageIcon className="h-16 w-16 mb-2 opacity-50" />
            <p className="font-medium text-gray-500">Aún no hay fotos</p>
          </div>
        ) : images.length === 1 ? (
          // CASO 2: Solo 1 Imagen (Ocupa todo)
          <img
            src={`${baseUrl}${images[0]}`}
            className="h-full w-full object-cover cursor-pointer hover:brightness-95 transition"
            alt="Principal"
          />
        ) : images.length === 2 ? (
          // CASO 3: 2 Imágenes (Mitad y mitad)
          <div className="grid h-full grid-cols-2 gap-2">
            <img
              src={`${baseUrl}${images[0]}`}
              className="h-full w-full object-cover cursor-pointer hover:brightness-95 transition"
              alt="Foto 1"
            />
            <img
              src={`${baseUrl}${images[1]}`}
              className="h-full w-full object-cover cursor-pointer hover:brightness-95 transition"
              alt="Foto 2"
            />
          </div>
        ) : (
          // CASO 4: 3 o más imágenes (Grid estilo Airbnb)
          <div className="grid h-full grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2">
            <div className="md:col-span-2 md:row-span-2 overflow-hidden">
              <img
                src={`${baseUrl}${images[0]}`}
                className="h-full w-full object-cover hover:brightness-90 transition cursor-pointer"
                alt="Principal"
              />
            </div>

            {sideImageSlots.map((img, index) => (
              <div
                key={index}
                className="hidden md:block overflow-hidden bg-gray-200"
              >
                {img ? (
                  <img
                    src={`${baseUrl}${img}`}
                    className="h-full w-full object-cover hover:brightness-90 transition cursor-pointer"
                    alt={`Foto ${index + 1}`}
                  />
                ) : (
                  // Placeholder sutil si tiene 3 o 4 imágenes (rellena el hueco vacío)
                  <div className="h-full w-full flex items-center justify-center bg-gray-100">
                    <ImageIcon className="h-6 w-6 text-gray-300" />
                  </div>
                )}
              </div>
            ))}

            {images.length > 5 && (
              <button className="absolute bottom-6 right-6 rounded-lg border border-gray-900 bg-white px-4 py-2 text-sm font-semibold shadow-sm hover:bg-gray-50 transition">
                Mostrar todas las fotos
              </button>
            )}
          </div>
        )}
      </section>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Columna Izquierda: Info */}
        <div className="lg:col-span-2">
          <div className="border-b border-gray-200 pb-6">
            <h2 className="text-xl font-semibold">
              Anfitrión: {property.host?.fullName || "Usuario Desconocido"}
            </h2>
            <p className="text-gray-600 mt-1">
              Capacidad máxima: {property.capacity} huéspedes
            </p>
          </div>

          <div className="py-8 border-b border-gray-200">
            <h3 className="text-lg font-semibold mb-4">Acerca de este lugar</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {property.description ||
                "El anfitrión no ha proporcionado una descripción detallada aún."}
            </p>
          </div>
        </div>

        {/* Columna Derecha: Caja de Reserva (Sticky) */}
        <div className="relative z-20">
          <BookingWidget property={property} />
        </div>
      </div>
    </div>
  );
}
