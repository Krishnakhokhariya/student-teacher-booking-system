import { useState } from "react";
import AdminNavbar from "../components/admin/AdminNavbar";
import AdminSidebar from "../components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">

      
      <div className="hidden md:block w-64 bg-white border-r shadow  fixed inset-y-0">
        <AdminSidebar />
      </div>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40"
             onClick={() => setSidebarOpen(false)}>
          <div className="w-64 bg-white h-full shadow-lg"
               onClick={(e) => e.stopPropagation()}>
            <AdminSidebar />
          </div>
        </div>
      )}

      <div className="flex-1 md:ml-64 flex flex-col">

        <AdminNavbar openSidebar={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>

       <footer className="bg-white text-center py-3 text-sm border-t">
      © {new Date().getFullYear()} Student-Teacher Appointment System
    </footer>
      </div>

    </div>
  );
}
