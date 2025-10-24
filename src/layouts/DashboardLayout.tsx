import Sidebar from "@/components/Sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen">
      {/* sidebar fixa */}
      <Sidebar />

      {/* área principal (onde cada página aparece) */}
      <main className="flex-1 bg-white overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
