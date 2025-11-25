import { Bars3Icon, ArrowRightEndOnRectangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import {useNavigate } from "react-router-dom";


export default function AdminNavbar({ openSidebar }) {
    const {logout, userProfile} = useAuth();
    const Navigate = useNavigate();

    async function handleLogout() {
    try {
      await logout();
      Navigate("/login", {replace:true});
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }
  return (
    <header className="w-full bg-gray-900 shadow-sm border-b px-4 py-3 flex items-center justify-between">
      
      <div className="flex gap-5">
      <button 
        onClick={openSidebar} 
        className="md:hidden text-white text-xl">
        <Bars3Icon className="h-7 w-7 text-white p-1 rounded hover:bg-gray-100 hover:text-gray-900" />
      </button>

      <h1 className="text-lg font-semibold text-white">
        Hello, {userProfile?.name || "Admin"}
      </h1>
    </div>
      <button
        onClick={handleLogout}
        className="flex font-semibold items-center gap-1 text-gray-100 p-2 py-1 rounded hover:bg-gray-100 hover:text-gray-800 transition"
      >
       Logout
      </button>
    </header>
  );
}
