import React, { act, useEffect, useState } from "react";
import TeacherLayout from "../../layouts/TeacherLayout";
import { useAuth } from "../../context/AuthContext";
import {
  getAppointmentsForTeacher,
  approveAppointment,
  rejectAppointment,
} from "../../utils/teacherAppointment";
import Modal from "../../components/Modal";
import { formatDate } from "../../utils/availability";

export default function TeacherAppointments() {
  const { userProfile } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedTab, setSelectedTab] = useState("pending");
  const [selected, setSelected] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [actionType, setActionType] = useState(""); 

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const today = new Date();
  today.setHours(0,0,0,0);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    setLoading(true);
    try {
      const list = await getAppointmentsForTeacher(userProfile.uid);
      list.sort((a, b) => new Date(a.date) - new Date(b.date));
      setAppointments(list);
    } catch (err) {
      showAlert("Failed to load appointments.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function showAlert(msg) {
    setAlertMessage(msg);
    setAlertOpen(true);
  }

  function openAction(type, app) {
    setSelected(app);
    setActionType(type);
    setConfirmOpen(true);
  }

  async function handleAction() {
    try {
      if (actionType === "approve") {
        await approveAppointment(selected.id, userProfile.uid, selected);
        updateList("approved");
        showAlert("Appointment approved.");
      }

      if (actionType === "reject" || actionType === "cancel") {
        await rejectAppointment(selected.id, userProfile.uid, selected);
        updateList("rejected");
        showAlert( actionType === "cancel" 
          ? "Appointment Cancelled."
          : "Appointment rejected.");
      }

    } catch (err) {
      showAlert("Action failed.");
      console.error(err);
    } finally {
      setConfirmOpen(false);
    }
  }

  function updateList(newStatus) {
    setAppointments((prev) =>
      prev.map((a) => (a.id === selected.id ? { ...a, status: newStatus } : a))
    );
  }

  const filtered = appointments.filter((a) => {
    const appDate = new Date(a.date);
    appDate.setHours(0,0,0,0);

    if(selectedTab === "pending"){
      return a.status === "pending" && appDate >= today;
    }
     if(selectedTab === "approved"){
      return a.status === "approved" && appDate >= today;
    }
     if(selectedTab === "rejected"){
      return a.status === "rejected" && appDate >= today;
    }
     if(selectedTab === "history"){
      return appDate < today;
    }

    return false;
  })

  

  return (
    <TeacherLayout>
      <h1 className="text-2xl font-semibold text-gray-800 mb-5">
        Manage Appointments
      </h1>

      <div className="flex gap-4 border-b pb-2 mb-4">
        {["pending", "approved", "rejected", "history"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`pb-2 capitalize text-sm font-medium border-b-2 ${
              selectedTab === tab
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500"
            }`}
          >
            {tab} (
              {
                appointments.filter((a) => {
                  const d = new Date(a.date);
                  d.setHours(0,0,0,0);

                  if(tab === "history") return d < today;
                  if(tab === a.status && d > today) return true;
                  return false;
                }).length
              }
              )
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading appointments...</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow text-center text-gray-500">
          No {selectedTab} appointments.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filtered.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-xl border shadow-sm p-4 flex flex-col gap-3"
            >
              <div>
                <p className="text-sm text-gray-500">Student</p>
                <p className="font-semibold text-gray-900">{app.studentName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(app.date)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium">{app.slot}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Purpose</p>
                <p className="text-sm text-gray-700">{app.purpose}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-sm text-gray-700">{app.status}</p>
              </div>

            {selectedTab !== "history" && (
              <div className="mt-auto flex gap-2">
                {selectedTab === "pending" && (
                  <>
                    <button
                      onClick={() => openAction("approve", app)}
                      className="flex-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openAction("reject", app)}
                      className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}

                {selectedTab === "approved" && (
                  <button
                    onClick={() => openAction("cancel", app)}
                    className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700"
                  >
                    Cancel
                  </button>
                )}

                {selectedTab === "rejected" && (
                  <button
                    onClick={() => openAction("approve", app)}
                    className="flex-1 px-3 py-1.5 bg-blue-700 text-white rounded-lg text-xs hover:bg-blue-800"
                  >
                    Approve Again
                  </button>
                )}
              </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={confirmOpen}
        title="Confirm Action"
        primaryLabel="Yes"
        onPrimaryClick={handleAction}
        onClose={() => setConfirmOpen(false)}
      >
        Are you sure?
      </Modal>

      <Modal
        isOpen={alertOpen}
        title="Notification"
        primaryLabel="OK"
        onPrimaryClick={() => setAlertOpen(false)}
        onClose={() => setAlertOpen(false)}
      >
        {alertMessage}
      </Modal>
    </TeacherLayout>
  );
}
