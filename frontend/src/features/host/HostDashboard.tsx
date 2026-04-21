import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Home,
  Edit,
  Trash2,
  Calendar,
  Users,
  DollarSign,
  Image as ImageIcon,
  Loader2,
  X,
  AlertTriangle,
} from "lucide-react";
import { useMyProperties } from "../../hooks/properties/useHostQueries";
import { useDeleteProperty } from "../../hooks/properties/useHostMutations";

export default function HostDashboard() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const {
    data: response,
    isLoading,
    isError,
  } = useMyProperties(page, pageSize);
  const deleteMutation = useDeleteProperty();

  const properties = response?.data?.items || [];
  const pagination = response?.data;

  // --- ESTADOS DEL MODAL ---
  const [modalState, setModalState] = useState<
    "closed" | "confirmDelete" | "error"
  >("closed");
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const openDeleteModal = (id: string) => {
    setSelectedPropId(id);
    setModalState("confirmDelete");
  };

  const confirmDelete = () => {
    if (!selectedPropId) return;

    deleteMutation.mutate(selectedPropId, {
      onSuccess: () => {
        setModalState("closed");
        setSelectedPropId(null);
        // Si la página queda vacía tras eliminar, retrocedemos una página si es posible
        if (properties.length === 1 && page > 1) {
          setPage(page - 1);
        }
      },
      onError: () => {
        setErrorMsg(
          "Ocurrió un error al intentar eliminar la propiedad. Verifique su conexión.",
        );
        setModalState("error");
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-20 text-center text-red-500">
        Error al cargar el panel de propiedades. Verifique su conexión o
        permisos.
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Mis Alojamientos
            </h1>
            <p className="mt-1 text-gray-600">
              Administra tus propiedades, disponibilidad y configuración.
            </p>
          </div>

          <Link
            to="/host/properties/new"
            className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition shadow-sm"
          >
            <Plus className="h-5 w-5" />
            Publicar nuevo alojamiento
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
              <Home className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Aún no tienes propiedades en esta página
            </h3>
            <p className="mt-2 text-gray-600">
              {page === 1
                ? "Es el momento perfecto para publicar tu primer espacio."
                : "Regresa a la página anterior para ver tus alojamientos."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-200">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Alojamiento
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Ubicación
                    </th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                      Detalles
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {properties.map((prop) => {
                    return (
                      <tr key={prop.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                              {prop.images && prop.images.length > 0 ? (
                                <img
                                  src={`${import.meta.env.VITE_API_DOMAIN_URL}${prop.images[0].url}`}
                                  className="h-full w-full object-cover"
                                  alt={prop.title}
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-50">
                                  <ImageIcon className="h-6 w-6 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <span className="font-semibold text-gray-900 line-clamp-2">
                              {prop.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 block">
                            {prop.city}
                          </span>
                          <span className="text-xs text-gray-400 block">
                            {prop.province}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                              <DollarSign className="h-4 w-4 text-gray-400" />
                              {prop.pricePerNight}{" "}
                              <span className="text-xs text-gray-500 font-normal">
                                / noche
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Users className="h-4 w-4 text-gray-400" />
                              Capacidad: {prop.capacity}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/host/properties/${prop.id}/images`}
                              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50 transition"
                              title="Gestionar Imágenes"
                            >
                              <ImageIcon className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/host/properties/${prop.id}/calendar`}
                              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50 transition"
                              title="Bloquear Fechas"
                            >
                              <Calendar className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/host/properties/edit/${prop.id}`}
                              className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50 transition"
                              title="Editar Propiedad"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => openDeleteModal(prop.id)}
                              className="rounded-lg border border-red-100 bg-red-50 p-2 text-red-600 hover:bg-red-100 transition"
                              title="Eliminar Propiedad"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Controles de Paginación */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-xl shadow-sm">
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando página{" "}
                  <span className="font-medium">{pagination.pageNumber}</span>{" "}
                  de{" "}
                  <span className="font-medium">{pagination.totalPages}</span>
                </p>
              </div>
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination.hasPreviousPage}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.hasNextPage}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    Siguiente
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- SISTEMA DE MODALES --- */}
      {modalState !== "closed" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal de Confirmación de Borrado */}
            {modalState === "confirmDelete" && (
              <>
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Eliminar Propiedad
                  </h3>
                  <button
                    onClick={() => setModalState("closed")}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="px-6 py-6">
                  <p className="text-gray-600">
                    ¿Está seguro de que desea eliminar esta propiedad? Esta
                    acción eliminará también sus reservas asociadas y no se
                    puede deshacer.
                  </p>
                </div>
                <div className="flex items-center justify-end gap-3 bg-gray-50 px-6 py-4">
                  <button
                    onClick={() => setModalState("closed")}
                    disabled={deleteMutation.isPending}
                    className="rounded-lg px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleteMutation.isPending}
                    className="flex min-w-25 items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 transition disabled:opacity-50 shadow-sm"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Eliminar"
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Modal de Error genérico */}
            {modalState === "error" && (
              <>
                <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
                  <div className="mb-4 rounded-full bg-red-100 p-3">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">
                    Ocurrió un error
                  </h3>
                  <p className="text-sm text-gray-600">{errorMsg}</p>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-center border-t border-gray-100">
                  <button
                    onClick={() => setModalState("closed")}
                    className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-800 transition shadow-sm"
                  >
                    Entendido
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
