import React, { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { useAuth } from "../../context/AuthContext";
import { getAppoinmentsForStudnet } from "../../utils/appointments";
import { collection, query, where, getDocs, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";

export default function StudentDashboard() {
  const { userProfile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [suggested, setSuggested] = useState([]);

  const [todayList, setTodayList] = useState([]);

  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });

  useEffect(() => {
    if (userProfile?.uid) loadData();
  }, [userProfile]);

  async function loadData() {
    const apps = await getAppoinmentsForStudnet(userProfile.uid);
    setAppointments(apps);
    const today = new Date().toISOString().split("T")[0];

    const todayApps = apps.filter((a) => a.date === today);
    setTodayList(todayApps);

    setStats({
      total: apps.length,
      approved: apps.filter((a) => a.status === "approved").length,
      pending: apps.filter((a) => a.status === "pending").length,
      rejected: apps.filter((a) => a.status === "rejected").length,
    });
    loadSuggestedTeachers(userProfile.department);
  }

  async function loadSuggestedTeachers(dept) {
    const ref = collection(db, "users");
    const q = query(
      ref,
      where("role", "==", "teacher"),
      where("department", "==", dept)
    );

    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

    setSuggested(list.slice(0, 3));
  }

  return (
    <StudentLayout>
      <h1 className="text-2xl font-semibold text-slate-800 mb-6">
        Welcome, {userProfile?.name}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Total Appointments"
          value={stats.total}
          color="bg-blue-500"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          color="bg-green-500"
        />
        <StatCard title="Pending" value={stats.pending} color="bg-orange-500" />
        <StatCard title="Rejected" value={stats.rejected} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1">
          <Section title="Today's Appointments">
            {todayList.length === 0 ? (
              <p className="text-sm text-gray-600">No appointments for today.</p>
            ) : (
              todayList.map((a) => <AppointmentCard key={a.id} app={a} />)
            )}
          </Section>

        <div>
          <Section title={`Suggested Teachers (${userProfile.department})`}>
            {suggested.length === 0 ? (
              <p className="text-sm text-gray-600">No matching teachers.</p>
            ) : (
              suggested.map((t) => <TeacherCard key={t.uid} teacher={t} />)
            )}
          </Section>
        </div>
      </div>
      <MiniCalendarStudent appointments={appointments} />
    </StudentLayout>
  );
}


function StatCard({ title, value, color }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-6 border hover:shadow-lg transition">
      <h3 className="text-gray-600 text-sm">{title}</h3>
      <p
        className={`text-3xl font-bold mt-2 ${color} text-white px-3 py-1 rounded-lg inline-block`}
      >
        {value}
      </p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-5 mb-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}



function AppointmentCard({ app }) {
  return (
    <div className="border rounded-xl p-4 mb-3 shadow-sm hover:shadow transition bg-slate-50">

      <div className="font-semibold text-slate-800">{app.teacherName}</div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">

        <div className="flex items-center gap-2 text-sm">
          <CalendarIcon className="h-5 w-5 text-gray-500" />
          <span>{formatIndian(app.date)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <ClockIcon className="h-5 w-5 text-gray-500" />
          <span>{app.slot}</span>
        </div>

        <div className="md:justify-self-start">
          <span
            className={`px-3 py-1 text-xs rounded-full inline-block ${
              app.status === "approved"
                ? "bg-green-100 text-green-700"
                : app.status === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {app.status}
          </span>
        </div>
      </div>

    </div>
  );
}

function TeacherCard({ teacher }) {
  return (
    <div className="border h-full rounded-xl p-4 mb-3 shadow-sm hover:shadow transition bg-white">
      <div className="font-semibold text-slate-800">{teacher.name}</div>
      <div className="text-sm text-slate-600">{teacher.department}</div>
    </div>
  );
}

function formatIndian(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
}

function MiniCalendarStudent({ appointments }) {
  const current = new Date();
  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const todayStr = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  function getAppointmentsByDate(date) {
    return appointments.filter(
      (a) => a.date === date && a.status !== "rejected"
    );
  }

  function getDayStatus(apps, isToday) {
    if (isToday) return "today";
    if (apps.some((a) => a.status === "approved")) return "approved";
    if (apps.some((a) => a.status === "pending")) return "pending";
    return "none";
  }

  const COLORS = {
    today: "bg-blue-600 text-white",
    approved: "bg-green-200 text-green-900",
    pending: "bg-orange-200 text-orange-900",
    none: "hover:bg-gray-200",
  };

  return (
    <div className="bg-white shadow-md rounded-xl p-5 space-y-4">
      <h2 className="text-xl font-semibold">
        Upcoming Appointments –{" "}
        {current.toLocaleString("default", { month: "long" })} {year}
      </h2>

      <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 text-center">
        {Array(firstDay)
          .fill(null)
          .map((_, i) => (
            <div key={"blank" + i}></div>
          ))}

        {Array(totalDays)
          .fill(null)
          .map((_, dayIndex) => {
            const day = dayIndex + 1;

            const dateStr = `${year}-${String(month + 1).padStart(
              2,
              "0"
            )}-${String(day).padStart(2, "0")}`;
            const isToday = dateStr === todayStr;

            const apps = getAppointmentsByDate(dateStr);
            const status = getDayStatus(apps, isToday);

            return (
              <div key={day} className="relative group">
                <div
                  className={`p-2 rounded-lg cursor-pointer transition ${COLORS[status]}`}
                >
                  {day}
                </div>

                {apps.length > 0 && (
                  <div className="absolute hidden group-hover:block bg-gray-900 text-white text-xs p-2 rounded-lg w-52 left-1/2 -translate-x-1/2 mt-2 z-50 shadow-xl">
                    {apps.map((a) => (
                      <div
                        key={a.id}
                        className="mb-1 pb-1 border-b border-gray-700"
                      >
                        <strong>{a.slot}</strong>
                        <br />
                        Teacher: {a.teacherName}
                        <br />
                        <span
                          className={`text-[10px] px-1 py-0.5 rounded ${
                            a.status === "approved"
                              ? "bg-green-500"
                              : "bg-orange-500"
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      <div className="flex flex-wrap gap-3 text-sm mt-3">
        <Legend color="bg-blue-600" text="Today" />
        <Legend color="bg-green-200" text="Approved" />
        <Legend color="bg-orange-200" text="Pending" />
        <Legend color="bg-gray-300" text="No Appointments" />
      </div>
    </div>
  );
}

function Legend({ color, text }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded ${color}`}></div>
      <span>{text}</span>
    </div>
  );
}
