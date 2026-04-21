import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import ConfirmAccount from "../features/auth/ConfirmAccount";
import CheckEmail from "../features/auth/CheckEmail";
import MainLayout from "../components/layout/MainLayout";
import Home from "../features/properties/Home";
import PropertyDetails from "../features/properties/PropertyDetails";
import MyTrips from "../features/reservations/MyTrips";
import Notifications from "../features/notifications/Notifications";
import PropertyForm from "../features/host/PropertyForm";
import HostDashboard from "../features/host/HostDashboard";

// 1. Bloquea a los que NO han iniciado sesión (Para rutas privadas)
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// 2. NUEVO: Bloquea a los Huéspedes (Solo permite a los Anfitriones)
const HostRoute = ({ children }: { children: React.ReactNode }) => {
  const isHost = useAuthStore((state) => state.isHost);
  // Si no es Host, lo mandamos al inicio (puedes mandarlo a una página de 403 No Autorizado si prefieres)
  if (!isHost) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// 3. NUEVO: Bloquea a los que YA iniciaron sesión (Para no mostrar el Login si ya están adentro)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

export const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas Públicas (Protegidas contra usuarios ya logueados) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/confirm"
        element={
          <PublicRoute>
            <ConfirmAccount />
          </PublicRoute>
        }
      />
      <Route
        path="/check-email"
        element={
          <PublicRoute>
            <CheckEmail />
          </PublicRoute>
        }
      />

      {/* Rutas Protegidas (Requieren Login) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Rutas para cualquier usuario logueado (Guest o Host) */}
        <Route index element={<Home />} />
        <Route path="properties/:id" element={<PropertyDetails />} />
        <Route path="my-trips" element={<MyTrips />} />
        <Route path="notifications" element={<Notifications />} />

        {/* Rutas ESTRICTAS solo para Anfitriones */}
        <Route
          path="host"
          element={
            <HostRoute>
              <HostDashboard />
            </HostRoute>
          }
        />
        <Route
          path="host/properties/new"
          element={
            <HostRoute>
              <PropertyForm />
            </HostRoute>
          }
        />
        <Route
          path="host/properties/edit/:id"
          element={
            <HostRoute>
              <PropertyForm />
            </HostRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
