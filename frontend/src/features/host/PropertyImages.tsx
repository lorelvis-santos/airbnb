import { useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Trash2,
  Loader2,
  Home,
  CheckCircle,
  X,
  AlertTriangle,
} from "lucide-react";
import { useProperty } from "../../hooks/properties/useQueries";
import {
  useUploadImages,
  useDeleteImage,
} from "../../hooks/properties/useHostMutations";

export default function PropertyImages() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: response, isLoading } = useProperty(id || "");
  const uploadMutation = useUploadImages();
  const deleteMutation = useDeleteImage();

  const property = response?.data;
  const images = property?.images || [];

  // --- ESTADOS DEL MODAL ---
  const [modalState, setModalState] = useState<
    "closed" | "confirmDelete" | "error"
  >("closed");

  // AHORA GUARDAMOS EL ID DE LA IMAGEN, NO LA URL
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && id) {
      const filesArray = Array.from(e.target.files);
      uploadMutation.mutate(
        { id, files: filesArray },
        {
          onSuccess: () => {
            if (fileInputRef.current) fileInputRef.current.value = "";
          },
          onError: () => {
            setErrorMsg(
              "Hubo un problema al intentar subir las imágenes. Verifica el formato o el tamaño.",
            );
            setModalState("error");
          },
        },
      );
    }
  };

  // Recibe el ID directamente
  const openDeleteModal = (imageId: string) => {
    setSelectedImageId(imageId);
    setModalState("confirmDelete");
  };

  // Ejecuta la eliminación real usando el ID exacto de la base de datos
  const confirmDelete = () => {
    if (!selectedImageId || !id) return;

    deleteMutation.mutate(
      { propertyId: id, imageId: selectedImageId },
      {
        onSuccess: () => {
          setModalState("closed");
          setSelectedImageId(null);
        },
        onError: () => {
          setErrorMsg("No se pudo eliminar la imagen. Inténtalo de nuevo.");
          setModalState("error");
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
    <>
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <Link
          to="/host"
          className="mb-6 flex w-fit items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al Panel
        </Link>

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Fotos del Alojamiento
            </h1>
            <p className="mt-1 text-gray-600">
              Sube imágenes atractivas para {property.title}
            </p>
          </div>
          <button
            onClick={() => navigate("/host")}
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-2 text-sm font-bold text-white hover:bg-green-700 transition"
          >
            <CheckCircle className="h-5 w-5" /> Finalizar
          </button>
        </div>

        {/* Zona de Subida */}
        <div className="mb-8 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center transition hover:bg-gray-100">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">Sube tus fotos</h3>
          <p className="text-sm text-gray-500 mb-6 mt-2">
            Puedes seleccionar varias imágenes a la vez (Formatos: JPG, PNG,
            WEBP)
          </p>

          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="mx-auto flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {uploadMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "Seleccionar Imágenes"
            )}
          </button>
        </div>

        {/* Galería */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {/* Mapeamos el objeto { id, url } */}
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 border border-gray-200 shadow-sm"
            >
              <img
                src={`${import.meta.env.VITE_API_DOMAIN_URL}${img.url}`}
                alt={`Property Image ${img.id}`}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
              {/* Botón de borrar */}
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                <button
                  onClick={() => openDeleteModal(img.id)}
                  className="rounded-full bg-red-600 p-3 text-white hover:bg-red-700 transition hover:scale-110 shadow-lg"
                  title="Eliminar foto"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 text-gray-400 border border-dashed rounded-xl border-gray-200">
              <Home className="h-12 w-12 mb-2 text-gray-300" />
              <p>Aún no hay fotos subidas</p>
            </div>
          )}
        </div>
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
                    Eliminar foto
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
                    ¿Estás seguro de que deseas eliminar esta imagen de forma
                    permanente? Esta acción no se puede deshacer.
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
