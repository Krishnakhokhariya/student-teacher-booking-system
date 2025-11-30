import React, { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { useAuth } from "../../context/AuthContext";
import { getAppoinmentsForStudnet } from "../../utils/appointments";
import { formatDate } from "../../utils/availability";

function MyAppointments() {
  const { userProfile } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.uid) return;

    async function load() {
      setLoading(true);
      try {
        const list = await getAppoinmentsForStudnet(userProfile.uid);
        list.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);

          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          return parseSlot(a.slot) - parseSlot(b.slot);
        });
        setAppointments(list);
      } catch (err) {
        console.error("Error in loading appointments: ", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userProfile?.uid]);

  function parseSlot(slot) {
    if (!slot) return 0;

    const raw = slot.split("-")[0].trim();
    let hour = parseInt(raw);
    const isPM = raw.toUpperCase().includes("PM");

    if (hour === 12) {
      hour = isPM ? 12 : 0;
    } else if (isPM) {
      hour += 12;
    }

    return hour;
  }
  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            My Appointments
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            View Your upcoming and past appointment requests.
          </p>
        </div>
      </div>
      {loading ? (
        <div className="bg-white rounded-xl p-6 shadow border text-center text-sm text-slate-500">
          Loading Appointments...
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-xl p-6 shadow border text-center text-sm text-slate-500">
          You have no appointments yet.{" "}
          <span className="font-medium">Start by searching for a teacher.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="space-y-1 text-sm">
                <div className="font-semibold text-slate-800">
                  {a.teacherName || "Teacher"}
                </div>
                <div className="text-xs text-slate-500">
                  Date:{" "}
                  <span className="font-medium">{formatDate(a.date)}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Time: <span className="font-medium">{a.slot}</span>
                </div>
                <div className="text-xs text-slate-500">
                  Purpose: {a.purpose}
                </div>
              </div>
              <div className="flex items-end sm:items-center gap-2 justify-between sm:justify-end">
                <span
                  className={`inline-flex px-2.5 py-1 text-xs rounded-full capitalize ${
                    a.status === "approved"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : a.status === "rejected"
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {a.status || "pending"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  );
}

export default MyAppointments;
