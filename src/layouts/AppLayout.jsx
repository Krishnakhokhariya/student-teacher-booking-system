import { useState } from "react";
import AppNavbar from "../components/layout/AppNavbar";
import AppSidebar from "../components/layout/AppSidebar";

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="hidden md:block w-60 bg-white border-r shadow fixed inset-y-0">
        <AppSidebar />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="w-64 bg-white h-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <AppSidebar />
          </div>
        </div>
      )}

      <div className="flex-1 md:ml-60 flex flex-col overflow-hidden">
        <AppNavbar openSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full">
          {children}
        </main>

        <footer className="bg-white text-center py-3 text-sm border-t">
          © {new Date().getFullYear()} Student-Teacher Appointment System
        </footer>
      </div>
    </div>
  );
}
