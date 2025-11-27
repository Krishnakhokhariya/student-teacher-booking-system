import AdminLayout from "../../layouts/AdminLayout";
import React, { useEffect, useState } from "react";
import { getAdminStatus, getRecentLogs } from "../../utils/adminStats";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  ArcElement,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  ArcElement,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTeacher: 0,   
    totalApproved: 0,
    totalRejected: 0,
    totalPending:  0, 
  });

  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    async function load(){
      const data = await getAdminStatus();
      setStats(data);

      const logs = await getRecentLogs(5);
      setRecentLogs(logs);

    }
    load();
  },[]);

  const barData = {
    labels: ["Teachers", "Approved", "Rejected", "Pending"],
    datasets: [
      {
        label: "Count",
        data: [
          stats.totalTeacher,
          stats.totalApproved,
          stats.totalPending,
          stats.totalRejected
        ],
        backgroundColor:  ["blue", "green", "orange", "yellow"],
      },
    ],
  };

  const pieData = {
    labels: ["Teachers", "Approved", "Rejected", "Pending"],
    datasets: [
      {
        data: [
          stats.totalTeacher,
          stats.totalApproved,
          stats.totalPending,
          stats.totalRejected
        ],
        backgroundColor:  ["blue", "green", "orange", "yellow"],
      },
    ],
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Teachers" value={stats.totalTeacher} color="bg-blue-600" />
        <StatCard title="Approved Studnets" value={stats.totalApproved} color="bg-green-500" />
        <StatCard title="Pending Students" value={stats.totalPending} color="bg-orange-600" />
        <StatCard title="Rejected Students" value={stats.totalRejected} color="bg-yellow-600" />
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        <div className="bg-white p-5 rounded-xl shadow-md border">
          <h2 className="text-lg font-semibold mb-3">User Overview</h2>
          <Bar data={barData} />
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md border">
          <h2 className="text-lg font-semibold mb-3">Distribution</h2>
          <Pie data={pieData} />
        </div>
      </div>
      
      <div className="bg-white p-5 rounded-xl shadow-md border">
        <h2 className="text-lg font-semibold mb-3">Recent Activity</h2>

        {recentLogs.length === 0 ? (
          <p className="text-slate-500 text-sm">No recent activity.</p>
        ) : (
          <ul className="divide-y">
            {recentLogs.map((log, i) => (
              <li key={i} className="py-3 text-sm">
                <span className="font-semibold">{log.action}</span> —{" "}
                {log.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 border hover:shadow-lg transition">
      <h3 className="text-gray-600 text-sm">{title}</h3>
      <p
        className={`text-3xl font-bold mt-2 ${color} text-white px-5 py-3 rounded-lg inline-block`}
      >
        {value}
      </p>
    </div>
  );
}
