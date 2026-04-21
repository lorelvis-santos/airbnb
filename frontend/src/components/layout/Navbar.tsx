import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, UserCircle, Tent } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useUser } from "../../hooks/user/useQueries";

export default function Navbar() {
  const { isHost, logout } = useAuthStore();
  const navigate = useNavigate();

  const { data: userResponse, isLoading } = useUser();
  const user = userResponse?.data;

  // Estado para el menú desplegable
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar el menú si se hace clic afuera
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

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Izquierda: Logo */}
          <div className="flex items-center shrink-0">
            <Link
              to="/"
              className="flex items-center gap-2 text-blue-600 transition-transform hover:scale-105"
            >
              <Tent className="h-8 w-8" strokeWidth={2.5} />
              <span className="hidden text-xl font-bold md:block">
                Airbnb Clone
              </span>
            </Link>
          </div>

          {/* Derecha: Controles de Usuario */}
          <div className="flex items-center justify-end gap-2">
            {isHost ? (
              <Link
                to="/host"
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50 lg:block"
              >
                Panel de Anfitrión
              </Link>
            ) : (
              <button className="hidden rounded-full px-4 py-2 text-sm font-medium text-gray-900 transition hover:bg-gray-50 lg:block">
                Pon tu espacio en Airbnb
              </button>
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

              {/* Dropdown Menu */}
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

                  {/* Vistas móviles para botones que se ocultan en pantallas pequeñas */}
                  {!isHost && (
                    <button className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 lg:hidden">
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
  );
}
