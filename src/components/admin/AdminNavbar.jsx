import { Bars3Icon, ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";


export default function AdminNavbar({ openSidebar }) {
    const {logout, userProfile} = useAuth();
    const Navigate = useNavigate();

    async function handleLogout() {
    try {
      await logout();
      Navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }
  return (
    <header className="w-full bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
      
      
      <button 
        onClick={openSidebar} 
        className="md:hidden text-gray-700 text-xl">
        <Bars3Icon className="h-6 w-6 text-gray-700" />
      </button>

      <h1 className="text-lg font-semibold text-gray-800">
        Admin Panel
      </h1>

      
      <button
        onClick={handleLogout}
        className="flex items-center gap-1 text-gray-900 hover:text-red-800 font-medium transition"
      >
        <ArrowRightEndOnRectangleIcon className="h-5 w-5" />
      </button>
    </header>
  );
}
