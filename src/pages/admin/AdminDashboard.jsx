import AdminLayout from "../../layouts/AdminLayout";

export default function AdminDashboard() {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Teachers" value="0" color="bg-blue-600" />
        <StatCard title="Pending Studnets" value="0" color="bg-yellow-500" />
        <StatCard title="Total Students" value="0" color="bg-green-600" />
      </div>

      <div className="bg-white p-5 rounded-xl shadow-md border">
        <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>
        <p className="text-gray-500 text-sm">Logs</p>
      </div>
    </AdminLayout>
  );
}

function StatCard({title, value,color}){
  return(
    <div className="bg-white shadow-md rounded-xl p-6 border hover:shadow-lg transition">
      <h3 className="text-gray-600 text-sm">{title}</h3>
      <p className={`text-3xl font-bold mt-2 ${color} text-white px-3 py-2 rounded-lg inline-block`}>{value}</p>
    </div>
  )
}