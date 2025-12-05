import React, { useEffect, useState } from "react";
import TeacherLayout from "../../layouts/TeacherLayout";
import { useAuth } from "../../context/AuthContext";
import { getAppointmentsForTeacher } from "../../utils/teacherAppointment";
import { getConversationPartners } from "../../utils/messages";
import { getTeacherAvailability } from "../../utils/availability";

function TeacherDashboard() {
  const { userProfile } = useAuth();
  const teacherUid = userProfile?.uid;

  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [contacts, setContacts] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    setLoading(true);

    const [apps, avl, cons] = await Promise.all([
      getAppointmentsForTeacher(teacherUid),
      getTeacherAvailability(teacherUid),
      getConversationPartners(teacherUid, "teacher"),
    ]);
    const normalizedAvailability = avl.map((a) => ({
      ...a,
      date: a.date,
      // date: new Date(a.date + "T00:00:00").toLocaleDateString("en-CA", {
      //   timeZone: "Asia/Kolkata",
      // }),
    }));

    setAppointments(apps);
    setAvailability(normalizedAvailability);
    setContacts(cons);
    setLoading(false);
  }

  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  const todayAppointments = appointments.filter(
    (a) => a.date === today && a.status !== "rejected"
  );

  const pendingAppointment = appointments.filter((a) => a.status === "pending");
  const approvedAppointment = appointments.filter(
    (a) => a.status === "approved"
  );
  const appointmentsDates = [...new Set(appointments.map((a) => a.date))];

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome, {userProfile?.name}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            label="Today's Appointments"
            value={todayAppointments.length}
            color="bg-blue-600"
          />

          <StatCard
            label="Pending Requests"
            value={pendingAppointment.length}
            color="bg-yellow-500"
          />

          <StatCard
            label="Approved Appointments"
            value={approvedAppointment.length}
            color="bg-green-600"
          />
        </div>

        <div className="bg-white shadow-md rounded-xl p-5">
          <h2 className="text-xl font-semibold mb-4">Today's Appointments</h2>

          {todayAppointments.length === 0 ? (
            <p className="text-gray-500">
              No appointments scheduled for today.
            </p>
          ) : (
            <div className="grid gap-4">
              {todayAppointments.map((app) => (
                <div
                  key={app.id}
                  className="p-4 border rounded-xl shadow-sm bg-gray-50 hover:shadow-md transition"
                >
                  <div className="text-lg font-medium text-gray-800">
                    {app.studentName}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Time: {app.slot}</p>
                  <p className="text-sm text-gray-600">
                    Purpose: {app.purpose}
                  </p>
                  <span className="mt-2 inline-block text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-600">
                    {app.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <MiniCalendar
          appointmentDates={appointmentsDates}
          appointments={appointments}
          availability={availability}
        />
      </div>
    </TeacherLayout>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-5 border hover:shadow-lg transition">
      <p className="text-sm text-gray-600">{label}</p>
      <p
        className={`text-3xl font-bold mt-2 inline-block px-4 py-1 rounded-lg text-white ${color}`}
      >
        {value}
      </p>
    </div>
  );
}

function MiniCalendar({ appointmentDates, appointments, availability }) {
  const current = new Date();
  const year = current.getFullYear();
  const month = current.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  function getAppointmentsByDate(date) {
    return appointments.filter(
      (a) => a.date === date && a.status !== "rejected"
    );
  }

  function getAvailableSlotsByDate(date) {
    const matching = availability.filter((a) => a.date === date);
    return matching.length > 0 ? matching.map((a) => a.slot) : [];
  }

  function getDayStatus(apps, slots, isToday) {
    if (isToday) return "today";
    if (apps.some((a) => a.status === "approved")) return "approved";
    if (apps.some((a) => a.status === "pending")) return "pending";
    if (slots.length > 0) return "available";
    return "none";
  }

  const COLORS = {
    today: "bg-blue-600 text-white",
    approved: "bg-green-200 text-green-900",
    pending: "bg-orange-200 text-orange-900",
    available: "bg-yellow-200 text-yellow-900",
    none: "hover:bg-gray-200",
  };

  const todayStr = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  return (
    <div className="bg-white shadow-md rounded-xl p-5 space-y-4">
      <h2 className="text-xl font-semibold">
        Calendar – {current.toLocaleString("default", { month: "long" })} {year}
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

            const isToday = todayStr === dateStr;

            const apps = getAppointmentsByDate(dateStr);
            const slots = getAvailableSlotsByDate(dateStr);

            const status = getDayStatus(apps, slots, isToday);

            const col = (dayIndex + firstDay) % 7;
            const row = Math.floor((dayIndex + firstDay) / 7);
            const totalRows = Math.ceil((firstDay + totalDays) / 7);

            const verticalClass =
              row === totalRows - 1 ? "bottom-full mb-2" : "top-full mt-2";

            let horizontalClass = "left-1/2 -translate-x-1/2";
            if (col <= 1) {
              horizontalClass = "left-0 translate-x-0";
            } else if (col >= 5) {
              horizontalClass = "right-0 translate-x-0";
            }

            const hasContent = apps.length > 0 || slots.length > 0;

            return (
              <div key={day} className="relative group">
                <div
                  className={`p-2 rounded-lg cursor-pointer transition ${COLORS[status]}`}
                >
                  {day}
                </div>

                {hasContent && (
                  <div
                    className={`
                      absolute hidden group-hover:block
                      bg-gray-900 text-white text-xs p-2 rounded-lg
                      w-56 max-w-[80vw]
                      shadow-xl z-50
                      ${verticalClass} ${horizontalClass}
                    `}
                  >
                    {apps.length > 0 ? (
                      <>
                        {apps.map((a) => (
                          <div
                            key={a.id}
                            className="mb-1 pb-1 border-b border-gray-700 last:border-b-0 last:pb-0"
                          >
                            <strong>{a.slot}</strong> — {a.studentName}
                            <span
                              className={`ml-1 text-[10px] px-1 py-0.5 rounded ${
                                a.status === "pending"
                                  ? "bg-orange-500"
                                  : "bg-green-500"
                              }`}
                            >
                              {a.status}
                            </span>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        <strong>Available Slots:</strong>
                        <ul className="ml-3 mt-1 list-disc">
                          {slots.map((s, idx) => (
                            <li className="list-none" key={idx}>{s} — No appointments</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      <div className="flex flex-wrap gap-3 text-sm mt-3">
        <Legend color="bg-blue-600" text="Today" />
        <Legend color="bg-green-200" text="Approved Appointment" />
        <Legend color="bg-orange-200" text="Pending Appointment" />
        <Legend color="bg-yellow-200" text="Available Slot" />
        <Legend color="bg-gray-300" text="No Availability" />
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

export default TeacherDashboard;
