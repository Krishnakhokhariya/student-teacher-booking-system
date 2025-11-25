export default function AdminSidebar() {
  return (
    <div className="h-full overflow-y-auto p-4">
      <h2 className="text-xl font-bold mb-6">Admin</h2>

      <nav className="space-y-3">
        <a href="/admin/dashboard" className="block text-gray-700">Dashboard</a>
        <a href="/admin/manage-teachers" className="block text-gray-700">Manage Teachers</a>
        <a href="/admin/approve-students" className="block text-gray-700">Approve Students</a>
      </nav>
    </div>
  );
}
