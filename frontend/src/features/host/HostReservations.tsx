import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useHostPropertyReservations } from "../../hooks/reservations/useQueries";

export default function HostReservations() {
  const { id } = useParams<{ id: string }>();
  const { data: response, isLoading } = useHostPropertyReservations(id || "");
  const reservations = response?.data || [];

  const translateStatus = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "Confirmada";
      case "Completed":
        return "Completada";
      case "Cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link
        to="/host"
        className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al Panel
      </Link>

      <h1 className="text-3xl font-bold mb-8">Reservaciones de la Propiedad</h1>

      {reservations.length === 0 ? (
        <div className="bg-gray-50 border border-dashed rounded-xl p-12 text-center text-gray-500">
          Aún no hay reservaciones para esta propiedad.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Fechas
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Estado
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">
                  Fecha de Solicitud
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reservations.map((res) => (
                <tr key={res.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {format(new Date(res.checkIn), "dd MMM", {
                      locale: es,
                    })} -{" "}
                    {format(new Date(res.checkOut), "dd MMM yyyy", {
                      locale: es,
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${res.status === "Confirmed" ? "bg-green-100 text-green-700" : res.status === "Completed" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}
                    >
                      {translateStatus(res.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {format(new Date(res.createdAt), "dd/MM/yyyy HH:mm")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
