import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Bell, Check, CheckCircle2, Loader2 } from "lucide-react"; // Quité CheckAll que no se usaba
import { useNotifications } from "../../hooks/notifications/useQueries";
import {
  useMarkAsRead,
  useMarkAllAsRead,
} from "../../hooks/notifications/useMutations";

export default function Notifications() {
  const [filterUnread, setFilterUnread] = useState(false);

  const { data: response, isLoading, isError } = useNotifications(filterUnread);
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  // 1. BLINDAJE: Aseguramos que siempre sea un array, pase lo que pase
  const notifications = Array.isArray(response?.data) ? response?.data : [];

  const hasUnread = notifications.some((n) => n.status === "Unread");

  const handleMarkAsRead = (id: string) => {
    markAsReadMutation?.mutate(id);
  };

  // 2. BLINDAJE: Formateo de fecha seguro y corrección de Zona Horaria (Timezone)
  const safeFormatDate = (dateString?: string) => {
    if (!dateString) return "Fecha desconocida";
    try {
      // Si la fecha que envía el backend NO termina en 'Z', se la agregamos.
      // Esto fuerza a JavaScript a interpretarla como hora UTC (Greenwich)
      // y la convertirá correctamente a la hora local de República Dominicana.
      const utcDateString = dateString.endsWith("Z")
        ? dateString
        : `${dateString}Z`;

      return formatDistanceToNow(new Date(utcDateString), {
        addSuffix: true,
        locale: es,
      });
    } catch {
      return "Fecha inválida";
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Bell className="h-8 w-8 text-blue-600" />
          Notificaciones
        </h1>

        <div className="flex flex-col items-end gap-3">
          {/* Filtro (Pills) */}
          <div className="flex rounded-lg bg-gray-100 p-1 w-fit">
            <button
              onClick={() => setFilterUnread(false)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                !filterUnread
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterUnread(true)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                filterUnread
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              No leídas
            </button>
          </div>

          {/* Botón de Marcar todas como leídas */}
          {hasUnread && (
            <button
              onClick={() => markAllAsReadMutation?.mutate()}
              disabled={markAllAsReadMutation?.isPending}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition disabled:opacity-50"
            >
              {markAllAsReadMutation?.isPending
                ? "Marcando..."
                : "Marcar todas como leídas"}
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : isError ? (
        <div className="p-20 text-center text-red-500">
          Error al cargar las notificaciones.
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
          <CheckCircle2 className="mx-auto h-12 w-12 text-gray-300 mb-3" />
          <p className="text-lg font-medium text-gray-900">Estás al día</p>
          <p>
            No tienes notificaciones{" "}
            {filterUnread ? "no leídas" : "en este momento"}.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((notification) => {
            const isUnread = notification.status === "Unread";

            // 3. BLINDAJE: Optional Chaining en caso de que la mutación no se haya inicializado bien
            const isMarkingThis =
              markAsReadMutation?.isPending &&
              markAsReadMutation?.variables === notification.id;

            return (
              <div
                key={notification.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-5 transition ${
                  isUnread
                    ? "border-blue-100 bg-blue-50/30"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Punto azul si no está leída */}
                  <div className="mt-1.5 shrink-0">
                    {isUnread ? (
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-600 shadow-sm shadow-blue-200"></div>
                    ) : (
                      <div className="h-2.5 w-2.5 rounded-full bg-gray-300"></div>
                    )}
                  </div>

                  <div>
                    <p
                      className={`text-sm ${isUnread ? "font-semibold text-gray-900" : "font-medium text-gray-600"}`}
                    >
                      {notification.message}
                    </p>
                    {/* Aplicamos la función segura de fechas */}
                    <p className="mt-1 text-xs text-gray-400">
                      {safeFormatDate(notification.createdAt)}
                    </p>
                  </div>
                </div>

                {isUnread && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    disabled={isMarkingThis}
                    className="shrink-0 self-end sm:self-auto rounded-lg bg-white border border-gray-200 p-2 text-xs font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isMarkingThis ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                    Marcar leída
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
