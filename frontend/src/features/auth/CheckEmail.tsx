// src/features/auth/CheckEmail.tsx
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Inbox } from "lucide-react";

export default function CheckEmail() {
  const location = useLocation();
  const email = location.state?.email || "tu correo electrónico";

  return (
    <div className="flex min-h-screen">
      {/* Panel Izquierdo: Contenido Limpio y Editorial */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-1/2 xl:w-[40%] bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Ícono sutil con fondo y color primario azul */}
          <div className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
            <Inbox className="h-7 w-7 text-blue-600 stroke-[1.5]" />
          </div>

          <div className="text-left">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Revisa tu bandeja de entrada
            </h2>
            <p className="mt-4 text-gray-600 text-lg">
              Acabamos de enviar un enlace seguro para confirmar tu cuenta a:
            </p>
            {/* El correo destacado en azul para confirmar visualmente */}
            <p className="mt-2 text-xl font-semibold text-black-600 truncate">
              {email}
            </p>
          </div>

          {/* Separador nativo y simple con espaciado natural (margin-y) */}
          <hr className="my-10 border-gray-200" />

          <div>
            <div className="space-y-4 text-gray-600">
              <p>
                Haz clic en el enlace dentro del correo para activar tu cuenta y
                comenzar a explorar.
              </p>
              <p className="text-sm text-gray-500">
                ¿No ves el correo? Revisa tu carpeta de spam o correo no deseado
                por si acaso.
              </p>
            </div>

            <div className="mt-10">
              {/* Enlace de regreso utilizando el color azul para dar indicio de acción */}
              <Link
                to="/login"
                className="group flex items-center text-sm font-semibold text-black-600 hover:text-black-500 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Derecho: Imagen continua con el flujo de Auth */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?q=80&w=2070&auto=format&fit=crop"
          alt="Persona revisando su computadora en un ambiente relajado"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
    </div>
  );
}
