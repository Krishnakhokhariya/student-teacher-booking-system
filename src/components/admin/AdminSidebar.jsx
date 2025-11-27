import { useAuth } from "../../context/AuthContext";
import { usePendingStudentsCount } from "../../hooks/usePendingStudentsCount";

export default function AdminSidebar() {
    const {userProfile } = useAuth();
    const {pendingCount} = usePendingStudentsCount();

  return (
    <div className="h-full overflow-y-auto p-4 rounded">
      <h2 className="text-xl font-bold mb-6">{userProfile .name}</h2>

      <nav className="space-y-3">
        <a href="/admin/dashboard" className="block text-gray-700 p-2 rounded hover:text-white hover:bg-gray-900">Dashboard</a>
        <a href="/admin/teachers" className="block text-gray-700 p-2 rounded hover:text-white hover:bg-gray-900">Manage Teachers</a>
        <a href="/admin/approve-students" className="block text-gray-700 p-2 rounded hover:text-white hover:bg-gray-900">Manage Students({pendingCount})</a>
        <a href="/admin/logs" className="block text-gray-700 p-2 rounded hover:text-white hover:bg-gray-900">View Logs</a>
      </nav>
    </div>
  );
}
