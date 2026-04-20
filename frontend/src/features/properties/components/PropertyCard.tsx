import { useState, useRef } from "react";
import { Link } from "react-router-dom";
// import { ChevronLeft, ChevronRight, Star, Heart } from "lucide-react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Property } from "../../../schemas/property.schema";

type PropertyCardProps = {
  property: Property;
};

export default function PropertyCard({ property }: PropertyCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const baseUrl =
    import.meta.env.VITE_API_DOMAIN_URL || "http://localhost:5062";
  const hasImages = property.images && property.images.length > 0;

  // Condición limpia para saber si es nuevo
  const isNew = property.reviewsCount === 0;

  // Función para mover el scroll al presionar las flechas (Desktop) sin loop
  const scrollToIndex = (index: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.offsetWidth,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  // Función para sincronizar los dots cuando el usuario hace swipe (Móvil)
  const handleScroll = () => {
    if (scrollRef.current) {
      const index = Math.round(
        scrollRef.current.scrollLeft / scrollRef.current.offsetWidth,
      );
      setCurrentIndex(index);
    }
  };

  return (
    <Link
      to={`/properties/${property.id}`}
      className="group cursor-pointer flex flex-col gap-3"
    >
      {/* --- Contenedor del Slider --- */}
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-200">
        {/* Pill de "Nuevo" */}
        {isNew && (
          <div className="absolute top-3 left-3 z-10 rounded-md bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-900 shadow-md">
            Nuevo
          </div>
        )}

        {/* Contenedor con Scroll Snapping (Swipe nativo) */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {hasImages ? (
            property.images.map((img, i) => (
              <div key={i} className="min-w-full snap-center relative">
                <img
                  src={`${baseUrl}${img}`}
                  alt={`Imagen de ${property.title}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            ))
          ) : (
            <div className="flex h-full min-w-full items-center justify-center text-gray-400">
              Sin imagen
            </div>
          )}
        </div>

        {/* Controles Desktop (Ocultos en móvil, visibles en hover en PC) */}
        {hasImages && property.images.length > 1 && (
          <div className="pointer-events-none absolute inset-0 hidden items-center justify-between px-2 opacity-0 transition-opacity sm:flex group-hover:opacity-100">
            {/* Botón Izquierdo: Solo se muestra si NO estamos en la primera imagen */}
            {currentIndex > 0 ? (
              <button
                onClick={(e) => scrollToIndex(currentIndex - 1, e)}
                className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md transition-transform hover:scale-105 hover:bg-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            ) : (
              <div /> // Espaciador para mantener el justify-between
            )}

            {/* Botón Derecho: Solo se muestra si NO estamos en la última imagen */}
            {currentIndex < property.images.length - 1 ? (
              <button
                onClick={(e) => scrollToIndex(currentIndex + 1, e)}
                className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md transition-transform hover:scale-105 hover:bg-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            ) : (
              <div /> // Espaciador para mantener el justify-between
            )}
          </div>
        )}

        {/* Puntos indicadores (Dots) sincronizados con el scroll */}
        {hasImages && property.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {property.images.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === i ? "bg-white scale-125" : "bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* --- Información de la Propiedad --- */}
      <div>
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-gray-900 truncate pr-2">
            {property.city}, {property.province || "RD"}
          </h3>

          {!isNew && (
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-3.5 w-3.5 fill-gray-900 text-gray-900" />
              <span className="text-sm font-light text-gray-800">
                {property.averageRating.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 truncate">{property.title}</p>

        <p className="mt-1 text-sm text-gray-900">
          <span className="font-semibold">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(property.pricePerNight)}
          </span>{" "}
          <span className="font-light text-gray-600">por noche</span>
        </p>
      </div>
    </Link>
  );
}
