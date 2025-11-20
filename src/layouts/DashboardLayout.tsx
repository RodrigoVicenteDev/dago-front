import Topbar from "@/components/Topbar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex flex-col h-screen">

      {/* 🔥 Nova barra superior */}
      <Topbar />

      {/* Área principal */}
      <main className="flex-1 bg-white overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
