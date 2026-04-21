import { useState, useMemo, useEffect } from "react";
import { format, differenceInDays, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Star, Loader2 } from "lucide-react";
import { AxiosError } from "axios";

import { useCreateReservation } from "../../../hooks/reservations/useMutations";
import type { PropertyDetail } from "../../../schemas/property.schema";
import type { BackendResponse } from "../../../types/api.types";
import { toast } from "react-toastify";

type BookingWidgetProps = {
  property: PropertyDetail;
};

export default function BookingWidget({ property }: BookingWidgetProps) {
  // 1. Estados Locales
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // 2. Hooks de Datos
  const createReservation = useCreateReservation();

  // --- NUEVO: Bloqueo de Scroll (Scroll Lock) ---
  useEffect(() => {
    if (isCalendarOpen) {
      document.body.style.overflow = "hidden"; // Bloquea el scroll
    } else {
      document.body.style.overflow = ""; // Restaura el scroll
    }

    // Función de limpieza por si el componente se desmonta mientras está abierto
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCalendarOpen]);

  // 3. Lógica Computada
  const disabledDates = useMemo(() => {
    const blocks =
      property.blocks?.map((block) => ({
        from: new Date(block.startDate),
        to: new Date(block.endDate),
      })) || [];
    return [{ before: startOfDay(new Date()) }, ...blocks];
  }, [property.blocks]);

  const nights =
    dateRange?.from && dateRange?.to
      ? differenceInDays(dateRange.to, dateRange.from)
      : 0;

  const basePrice = nights * property.pricePerNight;
  const serviceFee = nights > 0 ? basePrice * 0.1 : 0;
  const totalPrice = basePrice + serviceFee;

  // 4. Manejadores de Eventos
  const handleReserve = () => {
    if (!dateRange?.from || !dateRange?.to) {
      return toast.error("Selecciona las fechas de tu viaje.");
    }

    createReservation.mutate(
      {
        propertyId: property.id,
        checkIn: dateRange.from.toISOString(),
        checkOut: dateRange.to.toISOString(),
      },
      {
        onSuccess: () => {
          toast.success("¡Reserva confirmada exitosamente!");
          setDateRange(undefined);
          setIsCalendarOpen(false);
        },
        onError: (error: AxiosError<BackendResponse<null>>) => {
          const msg =
            error.response?.data?.errors?.[0] ||
            "Hubo un error al procesar la reserva.";
          toast.error(msg);
        },
      },
    );
  };

  // 5. Renderizado
  return (
    <div className="sticky top-28 rounded-2xl border border-gray-200 p-6 shadow-xl bg-white">
      {/* Cabecera del Widget */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-2xl font-bold">${property.pricePerNight}</span>
          <span className="text-gray-600"> noche</span>
        </div>
        <div className="flex items-center gap-1 text-sm font-semibold">
          <Star className="h-3 w-3 fill-gray-900" />
          {property.reviewsCount > 0
            ? property.averageRating?.toFixed(2)
            : "Nuevo"}
        </div>
      </div>

      {/* Contenedor relativo "Padre" */}
      <div className="relative mb-4">
        {/* Contenedor "Hijo" con los inputs */}
        <div className="rounded-xl border border-gray-400 overflow-hidden">
          <div
            className="grid grid-cols-2 border-b border-gray-400 cursor-pointer"
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
          >
            <div className="p-3 border-r border-gray-400 hover:bg-gray-50 transition">
              <p className="text-[10px] font-bold uppercase">Llegada</p>
              <p className="text-sm">
                {dateRange?.from
                  ? format(dateRange.from, "dd/MM/yyyy")
                  : "Añadir fecha"}
              </p>
            </div>
            <div className="p-3 hover:bg-gray-50 transition">
              <p className="text-[10px] font-bold uppercase">Salida</p>
              <p className="text-sm">
                {dateRange?.to
                  ? format(dateRange.to, "dd/MM/yyyy")
                  : "Añadir fecha"}
              </p>
            </div>
          </div>

          <div className="p-3">
            <p className="text-[10px] font-bold uppercase">Huéspedes</p>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full text-sm bg-transparent outline-none cursor-pointer"
            >
              {Array.from({ length: property.capacity }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} huésped{i > 0 ? "es" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendario estilo Modal Centrado */}
        {isCalendarOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity"
              onClick={() => setIsCalendarOpen(false)}
            />

            <div className="fixed left-1/2 top-1/2 z-50 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-2xl bg-white p-4 shadow-2xl sm:p-6 w-[95%] max-w-fit">
              <DayPicker
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                disabled={disabledDates}
                locale={es}
                numberOfMonths={1}
              />

              <div className="mt-4 flex w-full justify-end border-t border-gray-100 pt-4">
                <button
                  onClick={() => setIsCalendarOpen(false)}
                  className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-bold text-white transition hover:bg-gray-800 hover:scale-105"
                >
                  Aplicar fechas
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Botón Principal */}
      <button
        onClick={handleReserve}
        disabled={
          createReservation.isPending || !dateRange?.from || !dateRange?.to
        }
        className="w-full rounded-lg cursor-pointer bg-blue-600 py-3 font-bold text-white hover:bg-blue-700 transition disabled:opacity-50 flex justify-center"
      >
        {createReservation.isPending ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          "Reservar"
        )}
      </button>

      {/* Resumen de Pago */}
      {nights > 0 ? (
        <div className="mt-4 space-y-3">
          <p className="text-center text-sm text-gray-500 mb-4">
            No se te cobrará nada todavía
          </p>
          <div className="flex justify-between text-gray-700">
            <span className="underline">
              ${property.pricePerNight} x {nights} noches
            </span>
            <span>${basePrice}</span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span className="underline">Tarifa de servicio Airbnb</span>
            <span>${serviceFee}</span>
          </div>
          <hr className="border-gray-200" />
          <div className="flex justify-between font-bold text-gray-900 text-lg">
            <span>Total</span>
            <span>${totalPrice}</span>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-center text-sm text-gray-500">
          Introduce fechas para ver el precio
        </p>
      )}
    </div>
  );
}
