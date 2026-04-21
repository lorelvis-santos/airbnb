import { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import {
  propertyFormSchema,
  type PropertyFormData,
} from "../../schemas/property.schema";
import {
  useCreateProperty,
  useUpdateProperty,
} from "../../hooks/properties/useHostMutations";
import { useProperty } from "../../hooks/properties/useQueries";

export default function PropertyForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();

  // Si estamos editando, buscamos la data de la propiedad
  const { data: propertyResponse, isLoading: isLoadingProperty } = useProperty(
    id || "",
  );
  const property = propertyResponse?.data;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
  });

  // Precargar los datos cuando llegan del backend
  useEffect(() => {
    if (isEditing && property) {
      reset({
        title: property.title,
        description: property.description,
        city: property.city,
        province: property.province,
        pricePerNight: property.pricePerNight,
        capacity: property.capacity,
      });
    }
  }, [isEditing, property, reset]);

  const onSubmit = (data: PropertyFormData) => {
    if (isEditing && id) {
      updateMutation.mutate(
        { id, data },
        {
          onSuccess: () => navigate("/host"),
          onError: () => alert("Error al actualizar la propiedad."),
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: (res) => {
          // Extraemos el ID recién creado de la respuesta del backend
          const newId = res.data.id;
          // Lo enviamos directo a la vista de subir imágenes
          navigate(`/host/properties/${newId}/images`);
        },
        onError: () => alert("Error al crear la propiedad."),
      });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isEditing && isLoadingProperty) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        to="/host"
        className="mb-6 flex w-fit items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="h-4 w-4" /> Volver al Panel
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        {isEditing ? "Editar Alojamiento" : "Publicar Nuevo Alojamiento"}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm"
      >
        {/* Título y Descripción */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-2">
            Información Básica
          </h2>
          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Título del anuncio
            </label>
            <input
              {...register("title")}
              placeholder="Ej: Cabaña rústica con vista a la montaña"
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-gray-700">
              Descripción detallada
            </label>
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Describe lo que hace único a tu alojamiento..."
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Ubicación */}
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-2">
            Ubicación
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Ciudad / Municipio
              </label>
              <input
                {...register("city")}
                placeholder="Ej: Cotuí"
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.city && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.city.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Provincia
              </label>
              <input
                {...register("province")}
                placeholder="Ej: Sánchez Ramírez"
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.province && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.province.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Detalles y Precio */}
        <div className="space-y-4 pt-4">
          <h2 className="text-lg font-bold text-gray-900 border-b pb-2">
            Detalles y Precio
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Precio por noche ($USD)
              </label>
              <input
                type="number"
                step="0.01"
                {...register("pricePerNight", { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.pricePerNight && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.pricePerNight.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-gray-700">
                Capacidad máxima (personas)
              </label>
              <input
                type="number"
                {...register("capacity", { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.capacity && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.capacity.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex min-w-37.5 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {isEditing ? "Guardar Cambios" : "Siguiente: Imágenes"}
          </button>
        </div>
      </form>
    </div>
  );
}
