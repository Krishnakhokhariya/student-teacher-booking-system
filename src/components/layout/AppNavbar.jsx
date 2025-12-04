import { Bars3Icon, BellIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import {useNavigate } from "react-router-dom";
import {useUnreadNotificationsCount} from '../../hooks/useUnreadNotificationsCount.js';


export default function AppNavbar({ openSidebar }) {
    const {logout, userProfile} = useAuth();
    const Navigate = useNavigate();
    const {count} = useUnreadNotificationsCount();

    async function handleLogout() {
    try {
      await logout();
      Navigate("/login", {replace:true});
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  function openNotifications(){
    Navigate("/notifications");
  }

  return (
    <header className="w-full bg-gray-900 shadow-sm border-b px-4 py-3 flex items-center justify-between">
      
      <div className="flex gap-5 items-center">
      <button 
        onClick={openSidebar} 
        className="md:hidden text-white text-xl">
        <Bars3Icon className="h-7 w-7 text-white p-1 rounded hover:bg-gray-100 hover:text-gray-900" />
      </button>

      <h1 className="text-lg font-semibold text-white">
        AppointMe
      </h1>
    </div>
    <div className="flex items-center gap-3">
       <button
          onClick={openNotifications}
          className="relative p-1 rounded-full hover:bg-gray-800 text-gray-100"
          aria-label="Notifications"
        >
          <BellIcon className="h-6 w-6" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] leading-none text-white rounded-full px-1.5 py-0.5">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      <button
        onClick={handleLogout}
        className="flex font-semibold items-center gap-1 text-gray-100 p-2 py-1 rounded hover:bg-gray-100 hover:text-gray-800 transition"
      >
       Logout
      </button>
    </div>
    </header>
  );
}
