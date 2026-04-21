import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Loader2,
  MapPin,
  Calendar,
  XCircle,
  CheckCircle,
  X,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMyReservations } from "../../hooks/reservations/useQueries";
import {
  useCancelReservation,
  useCompleteReservation,
  useCreateReview,
} from "../../hooks/reservations/useMutations";
import {
  reviewFormSchema,
  type ReviewFormData,
} from "../../schemas/review.schema";
import { AxiosError } from "axios";
import type { BackendResponse } from "../../types/api.types";

export default function MyTrips() {
  const { data: response, isLoading, isError } = useMyReservations();
  const cancelMutation = useCancelReservation();
  const completeMutation = useCompleteReservation();
  const reviewMutation = useCreateReview();

  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<{ id: string; msg: string } | null>(
    null,
  );
  const [reviewError, setReviewError] = useState<string | null>(null);

  const reservations = response?.data || [];

  // --- FORMULARIO DE RESEÑAS ---
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const ratingValue = watch("rating");

  const openReviewModal = (id: string) => {
    reset(); // Limpia el formulario
    setReviewError(null);
    setReviewingId(id);
  };

  const onReviewSubmit = (data: ReviewFormData) => {
    if (!reviewingId) return;
    setReviewError(null);

    reviewMutation.mutate(
      { id: reviewingId, data },
      {
        onSuccess: () => {
          setReviewingId(null);
        },
        onError: (error: AxiosError<BackendResponse<null>>) => {
          const msg =
            error.response?.data?.errors?.[0] ||
            "Error al enviar la reseña. Inténtalo de nuevo.";
          setReviewError(msg);
        },
      },
    );
  };

  const handleCancel = (id: string) => {
    setErrorMsg(null);

    cancelMutation.mutate(id, {
      onSuccess: () => {
        setConfirmingId(null);
      },
      onError: (error: AxiosError<BackendResponse<null>>) => {
        const msg =
          error.response?.data?.errors?.[0] ||
          "No se pudo cancelar la reserva.";
        setErrorMsg({ id, msg });
        setConfirmingId(null);
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed":
        return (
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold text-green-700 w-fit">
            <CheckCircle className="h-3 w-3" /> Confirmada
          </span>
        );
      case "Cancelled":
        return (
          <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold text-red-700 w-fit">
            <XCircle className="h-3 w-3" /> Cancelada
          </span>
        );
      case "Completed":
        return (
          <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold text-blue-700 w-fit">
            <CheckCircle className="h-3 w-3" /> Completada
          </span>
        );
      default:
        return (
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold text-gray-700 w-fit">
            {status}
          </span>
        );
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  if (isError)
    return (
      <div className="p-20 text-center text-red-500">
        Error al cargar tus viajes.
      </div>
    );

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Mis Viajes</h1>

        {reservations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center text-gray-500 max-w-2xl mx-auto">
            <p className="text-lg font-medium text-gray-900 mb-2">
              Aún no tienes viajes reservados
            </p>
            <p>
              Es hora de quitarle el polvo a las maletas y empezar a planear tu
              próxima aventura.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {reservations.map((reservation) => {
              const isCancellingThis =
                cancelMutation.isPending &&
                cancelMutation.variables === reservation.id;

              const isCompletingThis =
                completeMutation.isPending &&
                completeMutation.variables === reservation.id;

              // Lógica de fechas: ¿Ya pasó el checkOut?
              const isPastCheckout =
                new Date(reservation.checkOut) < new Date();
              const canComplete =
                reservation.status === "Confirmed" && isPastCheckout;

              return (
                <div
                  key={reservation.id}
                  className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md h-full"
                >
                  {/* --- Parte Superior de la Tarjeta --- */}
                  <div>
                    <div className="mb-4 flex flex-col gap-2">
                      {getStatusBadge(reservation.status)}
                      <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                        {reservation.propertyTitle}
                      </h3>
                    </div>

                    <div className="mb-6 flex flex-col gap-3 text-sm text-gray-600">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                        <span>
                          {format(new Date(reservation.checkIn), "d MMM yyyy", {
                            locale: es,
                          })}{" "}
                          -{" "}
                          {format(
                            new Date(reservation.checkOut),
                            "d MMM yyyy",
                            {
                              locale: es,
                            },
                          )}
                        </span>
                      </div>

                      <Link
                        to={`/properties/${reservation.propertyId}`}
                        className="group flex items-center gap-2 transition w-fit"
                      >
                        <MapPin className="h-4 w-4 text-gray-400 group-hover:text-gray-900 shrink-0" />
                        <span className="underline cursor-pointer group-hover:text-gray-900">
                          Ver alojamiento
                        </span>
                      </Link>
                    </div>
                  </div>

                  {/* --- Parte Inferior (Acciones) --- */}
                  <div className="mt-auto border-t border-gray-100 pt-4">
                    {reservation.status === "Confirmed" && (
                      <div className="flex flex-col gap-2">
                        {canComplete ? (
                          <button
                            onClick={() =>
                              completeMutation.mutate(reservation.id)
                            }
                            disabled={isCompletingThis}
                            className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-2 text-sm font-bold text-white hover:bg-green-700 transition disabled:opacity-50 shadow-sm"
                          >
                            {isCompletingThis ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4" />
                            )}
                            Completar Viaje
                          </button>
                        ) : (
                          <>
                            {confirmingId === reservation.id ? (
                              <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95 duration-200">
                                <span className="text-xs font-semibold text-red-600 text-center">
                                  ¿Seguro que deseas cancelar?
                                </span>
                                <div className="flex gap-2 w-full">
                                  <button
                                    onClick={() => setConfirmingId(null)}
                                    disabled={isCancellingThis}
                                    className="flex-1 rounded-lg bg-gray-100 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 transition disabled:opacity-50"
                                  >
                                    No
                                  </button>
                                  <button
                                    onClick={() => handleCancel(reservation.id)}
                                    disabled={isCancellingThis}
                                    className="flex flex-1 items-center justify-center rounded-lg bg-red-600 py-2 text-sm font-bold text-white hover:bg-red-700 transition disabled:opacity-50"
                                  >
                                    {isCancellingThis ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      "Sí, cancelar"
                                    )}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setConfirmingId(reservation.id)}
                                className="w-full rounded-lg border border-red-200 bg-red-50 py-2 text-sm font-bold text-red-600 hover:bg-red-100 transition"
                              >
                                Cancelar Reserva
                              </button>
                            )}

                            {errorMsg?.id === reservation.id && (
                              <p className="text-xs font-semibold text-red-500 mt-2 text-center">
                                {errorMsg.msg}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {reservation.status === "Completed" && (
                      <button
                        onClick={() => openReviewModal(reservation.id)}
                        className="w-full rounded-lg bg-gray-900 py-2 text-sm font-bold text-white hover:bg-gray-800 transition shadow-sm"
                      >
                        Dejar una reseña
                      </button>
                    )}

                    {reservation.status === "Cancelled" && (
                      <p className="text-xs text-center text-gray-400">
                        Esta reserva ha sido anulada.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODAL DE RESEÑAS --- */}
      {reviewingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-900">
                ¿Cómo fue tu estancia?
              </h3>
              <button
                onClick={() => setReviewingId(null)}
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onReviewSubmit)}
              className="px-6 py-6 flex flex-col gap-6"
            >
              <div className="flex flex-col items-center">
                <span className="text-sm font-semibold text-gray-700 mb-2">
                  Calificación general
                </span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setValue("rating", star, { shouldValidate: true })
                      }
                      className="focus:outline-none focus:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-9 w-9 transition-colors ${
                          ratingValue >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {errors.rating && (
                  <p className="text-xs text-red-500 mt-2">
                    {errors.rating.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cuéntanos más sobre tu experiencia
                </label>
                <textarea
                  {...register("comment")}
                  rows={4}
                  placeholder="El alojamiento fue increíble, muy limpio y el anfitrión muy atento..."
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
                {errors.comment && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.comment.message}
                  </p>
                )}
              </div>

              {reviewError && (
                <div className="rounded-lg bg-red-50 p-3 text-center text-sm font-semibold text-red-600">
                  {reviewError}
                </div>
              )}

              <button
                type="submit"
                disabled={reviewMutation.isPending}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
              >
                {reviewMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Enviar reseña"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
