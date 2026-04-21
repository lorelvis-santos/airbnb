import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { DayPicker, type DateRange } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Loader2,
  Trash2,
  Lock,
  AlertTriangle,
} from "lucide-react";
import "react-day-picker/dist/style.css";

import { useProperty } from "../../hooks/properties/useQueries";
import {
  useBlockDates,
  useUnblockDates,
} from "../../hooks/properties/useHostMutations";
import type {
  PropertyBlock,
  PropertyReservation,
} from "../../schemas/property.schema";

export default function PropertyCalendar() {
  const { id } = useParams<{ id: string }>();
  const { data: response, isLoading } = useProperty(id);
  const blockMutation = useBlockDates();
  const unblockMutation = useUnblockDates();

  const [range, setRange] = useState<DateRange | undefined>();
  const [errorMsg, setErrorMsg] = useState("");

  const property = response?.data;

  // Usamos los tipos extraídos de tu schema
  const blocks: PropertyBlock[] = property?.blocks || [];
  const reservations: PropertyReservation[] = property?.reservations || [];

  // Mapeamos las fechas ocupadas para bloquearlas visualmente en el DayPicker
  const disabledDates = [
    { before: new Date() }, // No se puede bloquear el pasado
    ...blocks.map((b) => ({
      from: new Date(b.startDate),
      to: new Date(b.endDate),
    })),
    ...reservations.map((r) => ({
      from: new Date(r.checkIn),
      to: new Date(r.checkOut),
    })),
  ];

  const handleBlock = () => {
    if (!range?.from || !range?.to || !id) return;

    setErrorMsg("");

    blockMutation.mutate(
      {
        id,
        data: {
          startDate: range.from.toISOString(),
          endDate: range.to.toISOString(),
        },
      },
      {
        onSuccess: () => {
          setRange(undefined);
        },
        onError: () => {
          setErrorMsg(
            "Error al bloquear las fechas. Verifica que no se solapen con otras reservas.",
          );
        },
      },
    );
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  if (!property)
    return (
      <div className="p-20 text-center text-red-500">
        Propiedad no encontrada
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/host"
        className="mb-6 flex w-fit items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al Panel
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <CalendarIcon className="h-8 w-8 text-blue-600" />
          Disponibilidad: {property.title}
        </h1>
        <p className="mt-1 text-gray-600">
          Bloquea fechas manualmente para mantenimiento o uso personal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Columna Izquierda: Calendario */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-center">
          <h2 className="text-lg font-bold text-gray-900 mb-4 w-full border-b pb-2">
            Seleccionar Fechas
          </h2>

          <DayPicker
            mode="range"
            selected={range}
            onSelect={setRange}
            locale={es}
            disabled={disabledDates}
            numberOfMonths={1}
            className="border-none"
          />

          {errorMsg && (
            <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg w-full">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            onClick={handleBlock}
            disabled={!range?.from || !range?.to || blockMutation.isPending}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition disabled:opacity-50"
          >
            {blockMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Lock className="h-5 w-5" />
            )}
            Bloquear Fechas
          </button>
        </div>

        {/* Columna Derecha: Lista de Bloqueos */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
            Bloqueos Activos
          </h2>

          {blocks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-12">
              <CalendarIcon className="h-12 w-12 mb-2 opacity-20" />
              <p>No hay bloqueos manuales activos</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-100 pr-2">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl hover:border-gray-200 transition"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-700">
                      {format(new Date(block.startDate), "dd MMM yyyy", {
                        locale: es,
                      })}
                    </span>
                    <span className="text-xs text-gray-500">
                      al{" "}
                      {format(new Date(block.endDate), "dd MMM yyyy", {
                        locale: es,
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      unblockMutation.mutate({
                        propertyId: id!,
                        blockId: block.id,
                      })
                    }
                    disabled={unblockMutation.isPending}
                    className="p-2 text-red-500 bg-white border border-red-100 shadow-sm hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                    title="Eliminar bloqueo"
                  >
                    {unblockMutation.isPending &&
                    unblockMutation.variables?.blockId === block.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
