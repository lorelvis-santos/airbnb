import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  UserCircle,
  Tent,
  Bell,
  Loader2,
  X,
  CheckCircle,
  Home,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useUser } from "../../hooks/user/useQueries";
import { useUnreadCount } from "../../hooks/notifications/useQueries";
import { useBecomeHost } from "../../hooks/user/useMutations";

export default function Navbar() {
  const { isHost, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: userResponse, isLoading } = useUser();
  const user = userResponse?.data;

  const { data: countResponse } = useUnreadCount();
  const unreadCount = countResponse?.data?.unreadCount || 0;

  const becomeHostMutation = useBecomeHost();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // --- ESTADOS DEL MODAL ---
  const [modalState, setModalState] = useState<
    "closed" | "confirm" | "success" | "error"
  >("closed");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Abre el modal y cierra el dropdown si estaba abierto
  const openHostModal = () => {
    setIsMenuOpen(false);
    setModalState("confirm");
    setErrorMsg("");
  };

  // Ejecuta la mutación
  const confirmBecomeHost = () => {
    becomeHostMutation.mutate(undefined, {
      onSuccess: () => {
        setModalState("success");
        // Redirección automática elegante después de 3.5 segundos
        setTimeout(() => {
          setModalState("closed");
          logout();
          navigate("/login");
        }, 3500);
      },
      onError: () => {
        setModalState("error");
        setErrorMsg(
          "Ocurrió un problema al actualizar tus permisos. Inténtalo de nuevo.",
        );
      },
    });
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center shrink-0">
              <Link
                to="/"
                className="flex items-center gap-2 text-blue-600 transition-transform hover:scale-105"
              >
                <Tent className="h-8 w-8" strokeWidth={2.5} />
                <span className="hidden text-xl font-bold md:block">
                  Airbnb
                </span>
              </Link>
            </div>

            {/* Controles de Usuario */}
            <div className="flex items-center justify-end gap-2">
              {isHost ? (
                <Link
                  to="/host"
                  className="hidden rounded-full px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50 lg:block"
                >
                  Panel de Anfitrión
                </Link>
              ) : (
                user && (
                  <button
                    onClick={openHostModal}
                    className="hidden rounded-full px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50 lg:block"
                  >
                    Pon tu espacio en Airbnb
                  </button>
                )
              )}

              {user && (
                <Link
                  to="/notifications"
                  className="relative mr-2 p-2 text-gray-600 hover:text-gray-900 transition"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Menú de Usuario con Dropdown */}
              <div className="relative ml-2" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-gray-300 bg-white p-2 transition hover:shadow-md"
                >
                  <Menu className="h-5 w-5 text-gray-600" />
                  <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-gray-500 text-white">
                    {isLoading ? (
                      <span className="h-full w-full animate-pulse bg-gray-300"></span>
                    ) : user ? (
                      <span className="text-xs font-semibold">
                        {user.fullName.charAt(0).toUpperCase()}
                      </span>
                    ) : (
                      <UserCircle className="h-full w-full text-gray-300" />
                    )}
                  </div>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 origin-top-right rounded-xl bg-white py-2 shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {user?.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      to="/my-trips"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Mis viajes
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100"
                    >
                      Notificaciones
                    </Link>

                    {!isHost && user && (
                      <button
                        onClick={openHostModal}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 lg:hidden"
                      >
                        Pon tu espacio en Airbnb
                      </button>
                    )}

                    {isHost && (
                      <Link
                        to="/host"
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 lg:hidden"
                      >
                        Panel de Anfitrión
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- MODAL PROFESIONAL --- */}
      {modalState !== "closed" && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm transition-all p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* ESTADO 1: Confirmación */}
            {(modalState === "confirm" || modalState === "error") && (
              <>
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Home className="h-5 w-5 text-blue-600" />
                    Convertirse en Anfitrión
                  </h3>
                  <button
                    onClick={() => setModalState("closed")}
                    className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="px-6 py-6">
                  <p className="text-gray-600 mb-4">
                    Estás a un paso de empezar a ganar dinero compartiendo tu
                    espacio.
                  </p>
                  <div className="rounded-xl bg-blue-50 p-4 border border-blue-100 text-sm text-blue-800">
                    <strong>Nota de seguridad:</strong> Al confirmar, tu sesión
                    actual se cerrará automáticamente para poder aplicarte los
                    nuevos permisos de Anfitrión. Solo tendrás que volver a
                    iniciar sesión.
                  </div>

                  {modalState === "error" && (
                    <p className="mt-4 text-sm font-semibold text-red-600 text-center">
                      {errorMsg}
                    </p>
                  )}
                </div>
                <div className="flex items-center justify-end gap-3 bg-gray-50 px-6 py-4">
                  <button
                    onClick={() => setModalState("closed")}
                    disabled={becomeHostMutation.isPending}
                    className="rounded-lg px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmBecomeHost}
                    disabled={becomeHostMutation.isPending}
                    className="flex min-w-30 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {becomeHostMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Sí, continuar"
                    )}
                  </button>
                </div>
              </>
            )}

            {/* ESTADO 2: Éxito (Celebración y Redirección) */}
            {modalState === "success" && (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <div className="mb-4 rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  ¡Felicidades, Anfitrión!
                </h3>
                <p className="text-gray-600">
                  Tus permisos han sido actualizados con éxito.
                </p>
                <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirigiendo al inicio de sesión...
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
