import React, { useEffect, useState } from "react";
import AdminLayout from "../../../layouts/AdminLayout";
import { useAuth } from "../../../context/AuthContext";
import {
  getPendingStudents,
  approveStudent,
  rejectStudent,
} from "../../../utils/studnets";
import Modal from "../../../components/Modal";

function ApproveStudents() {
  const { userProfile } = useAuth();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [actionType, setActionType] = useState("approved");

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    loadPending();
  }, []);

  async function loadPending() {
    setLoading(true);
    try {
      const list = await getPendingStudents();
      setStudents(list);
    } catch (err) {
      console.error("Failed to load studnets", err);
      showAlert("Failed to load pending students.");
    } finally {
      setLoading(false);
    }
  }

  function showAlert(msg){
    setAlertMessage(msg);
    setAlertOpen(true);
  }

  function openApprove(student) {
    setSelectedStudent(student);
    setActionType("approved");
    setConfirmOpen(true);
  }

  function openReject(student) {
    setSelectedStudent(student);
    setActionType("rejected");
    setRejectOpen(true);
  }

  async function handleApprove() {
    if (!selectedStudent) return;
    const student = selectedStudent;
    try {
      await approveStudent(student, userProfile.uid);
      setStudents((prev) => prev.filter((s) => s.uid !== student.uid));
      showAlert(`Student "${student.name}" has been approved. `);
    } catch (err) {
      console.error(err);
      showAlert(`Failed to approve student: ${err.message || err}`);
    } finally {
      setConfirmOpen(false);
      setSelectedStudent(null);
    }
  }

  async function handleReject() {
    if (!selectedStudent) return;
    const student = selectedStudent
    try {
      await rejectStudent(student, userProfile.uid);
      setStudents((prev) => prev.filter((s) => s.uid !== student.uid));
       showAlert(`Student "${student.name}" has been approved. `);
    } catch (err) {
      console.error(err);
      alert(`Failed to reject student: ${err.message || err}`);
    } finally {
      setRejectOpen(false);
      setSelectedStudent(null);
    }
  }

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Approve Studnets
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review new student registrations and approve or reject them
          </p>
        </div>

        <div className="text-sm text-slate-500">
          Pending: {""}
          <span className="font-semibold text-slate-800">
            {students.length}
          </span>
        </div>
      </div>
      {loading ? (
        <p>Loading Pending students</p>
      ) : students.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-500">
          No pending studnets registrations
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100 text-slate-600">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Student ID</th>
                  <th className="p-3 text-left">Department</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Registered On</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr
                    key={s.uid}
                    className="border-b last:border-0 hover:bg-slate-50"
                  >
                    <td className="p-3">
                      <div className="font-medium text-slate-800">{s.name}</div>
                    </td>
                    <td className="p-3 text-slate-700">{s.studentId || "-"}</td>
                    <td className="p-3 text-slate-700">
                      {s.department || "-"}
                    </td>
                    <td className="p-3 text-slate-700">{s.email || "-"}</td>
                    <td className="p-3 text-slate-500">
                      {s.createdAt?.toDate
                        ? s.createdAt.toDate().toLocaleString()
                        : "-"}
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openApprove(s)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => openReject(s)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 transition"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={confirmOpen}
        title="Approve Student?"
        primaryLabel="Approve"
        onPrimaryClick={handleApprove}
        onClose={() => setConfirmOpen(false)}
      >
        <p>
          Do you want to{""}
          <span className="font-semibold text-emerald-700">approve</span>{" "}
          student <span className="font-semibold">{selectedStudent?.name}</span>{" "}
          ({selectedStudent?.email})?
        </p>
      </Modal>

      <Modal
        isOpen={rejectOpen}
        title="Reject Student?"
        primaryLabel="Reject"
        onPrimaryClick={handleReject}
        onClose={() => setRejectOpen(false)}
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            You are about to{" "}
            <span className="font-semibold text-rose-700">reject</span> student{" "}
            <span className="font-semibold">{selectedStudent?.name}</span> (
            {selectedStudent?.email}).
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={alertOpen}
        title="Notification"
        primaryLabel="OK"
        onPrimaryClick={() => setAlertOpen(false)}
        onClose={() => setAlertOpen(false)}
      >
        <p className="text-gray-700">{alertMessage}</p>
      </Modal>
    </AdminLayout>
  );
}

export default ApproveStudents;
