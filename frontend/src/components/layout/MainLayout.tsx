import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Contenido dinámico */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
