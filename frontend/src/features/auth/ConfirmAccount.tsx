import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AuthAPI } from "../../api/AuthAPI";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { AxiosError } from "axios";
import type { BackendResponse } from "../../types/api.types";

export default function ConfirmAccount() {
  // 1. Extraemos los parámetros de la URL
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // 2. Ejecutamos la petición automáticamente si existen los parámetros
  const { isLoading, isError, isSuccess, error } = useQuery({
    queryKey: ["confirmAccount", token],
    queryFn: () => AuthAPI.confirmEmail(token),
    // Solo se ejecuta s y token están en la URL
    enabled: !!token,
    retry: false, // No reintentamos si falla (ej. si el token expiró)
  });

  // Escenario 1: URL inválida (Faltan parámetros)
  if (!token) {
    return (
      <StatusLayout
        icon={<XCircle className="h-16 w-16 text-red-500" />}
        title="Enlace inválido"
        description="El enlace de confirmación no es válido o está incompleto."
      />
    );
  }

  // Escenario 2: Cargando
  if (isLoading) {
    return (
      <StatusLayout
        icon={<Loader2 className="h-16 w-16 text-blue-500 animate-spin" />}
        title="Confirmando tu cuenta..."
        description="Por favor espera un momento mientras verificamos tus datos."
      />
    );
  }

  // Escenario 3: Error (Token expirado, usuario ya confirmado, etc.)
  if (isError) {
    const axiosError = error as AxiosError<BackendResponse<null>>;
    const errorMessage =
      axiosError.response?.data?.errors?.[0] ||
      "No se pudo confirmar tu cuenta. Es posible que el enlace haya expirado.";

    return (
      <StatusLayout
        icon={<XCircle className="h-16 w-16 text-red-500" />}
        title="Error en la confirmación"
        description={errorMessage}
      />
    );
  }

  // Escenario 4: Éxito
  if (isSuccess) {
    return (
      <StatusLayout
        icon={<CheckCircle2 className="h-16 w-16 text-green-500" />}
        title="¡Cuenta Confirmada!"
        description="Tu cuenta ha sido verificada exitosamente. Ya puedes acceder a todas las funciones de la plataforma."
      />
    );
  }

  return null;
}

function StatusLayout({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-gray-100 text-center space-y-6">
        <div className="flex justify-center">{icon}</div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-gray-600">{description}</p>
        </div>
        <div className="pt-4">
          <Link
            to="/login"
            className="inline-flex justify-center w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
          >
            Ir a Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
