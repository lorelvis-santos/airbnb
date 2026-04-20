import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import ConfirmAccount from "../features/auth/ConfirmAccount";
import CheckEmail from "../features/auth/CheckEmail";
import MainLayout from "../components/layout/MainLayout";
import Home from "../features/properties/Home";
import PropertyDetails from "../features/properties/PropertyDetails";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export const AppRouter = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/confirm" element={<ConfirmAccount />} />
      <Route path="/check-email" element={<CheckEmail />} />

      {/* Rutas Protegidas */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
