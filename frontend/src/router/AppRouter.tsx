import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import ConfirmAccount from "../features/auth/ConfirmAccount";
import CheckEmail from "../features/auth/CheckEmail";

// 1. Componente Guardián (Protege las rutas privadas)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Si no está autenticado, lo mandamos al login y reemplazamos el historial
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderizamos el contenido (la vista)
  return <>{children}</>;
};

// 2. Definición principal de las rutas
export const AppRouter = () => {
  return (
    <Routes>
      {/* --- RUTAS PÚBLICAS --- */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/confirm" element={<ConfirmAccount />} />
      <Route path="/check-email" element={<CheckEmail />} />

      {/* --- RUTAS PROTEGIDAS --- */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div className="flex h-screen items-center justify-center bg-gray-100">
              <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-gray-800">Airbnb</h1>
                <p className="text-xl text-gray-600">
                  Catálogo de propiedades (En construcción 🚀)
                </p>
                <p className="text-sm text-gray-500">
                  ¡Si estás viendo esto, tu inicio de sesión funcionó
                  perfectamente!
                </p>
              </div>
            </div>
          </ProtectedRoute>
        }
      />

      {/* Ruta comodín (404): Si el usuario escribe una ruta que no existe, lo mandamos al home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
