import React from 'react'
import StudentLayout from '../../layouts/StudentLayout'

export default function StudentDashboard() {
  return (
   <StudentLayout>
    <h1 className="text-2xl font-semibold text-gray-800 mb-4">Student Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard title="Total Appoinments" value="0" color="bg-blue-600" />
        <DashboardCard title="Pending Appoinments" value="0" color="bg-yellow-600" />
        <DashboardCard title="Available Slots" value="0" color="bg-green-600" />
      </div>
   </StudentLayout>
  )
}

function DashboardCard({title, value, color}){
  return(
    <div className="bg-white p-6 rounded-xl shadow border hover:shadow-lg transition">
      <h2 className="text-gray-600 text-sm">{title}</h2>
      <div className={`${color} text-white text-3xl font-bold px-4 py-2 rounded-lg inline-block mt-2`}>{value}</div>
    </div>
  )
}


