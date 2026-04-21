import { Link } from "react-router-dom";
import { Menu, UserCircle, Tent } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useUser } from "../../hooks/user/useQueries";

export default function Navbar() {
  const isHost = useAuthStore((state) => state.isHost);

  const { data: userResponse, isLoading } = useUser();
  const user = userResponse?.data;

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
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

            <div className="relative ml-2">
              <button className="flex items-center gap-2 rounded-full border border-gray-300 bg-white p-2 transition hover:shadow-md">
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
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
