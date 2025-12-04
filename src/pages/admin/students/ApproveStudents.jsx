import React, { useEffect, useState } from "react";
import AdminLayout from "../../../layouts/AdminLayout";
import { useAuth } from "../../../context/AuthContext";
import {
  getPendingStudents,
  getRejectedStudents,
  approveStudent,
  rejectStudent,
} from "../../../utils/studnets";
import Modal from "../../../components/Modal";

function ApproveStudents() {
  const { userProfile } = useAuth();

  const [pendingStudents, setPendingStudents] = useState([]);
  const [rejectedStudents, setRejectedStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("pending"); // "pending" | "rejected"

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSource, setSelectedSource] = useState("pending"); // from which list?

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [pending, rejected] = await Promise.all([
        getPendingStudents(),
        getRejectedStudents(),
      ]);
      setPendingStudents(pending);
      setRejectedStudents(rejected);
    } catch (err) {
      console.error("Failed to load students", err);
      showAlert("Failed to load students.");
    } finally {
      setLoading(false);
    }
  }

  function showAlert(msg) {
    setAlertMessage(msg);
    setAlertOpen(true);
  }

  function openApprove(student, source) {
    setSelectedStudent(student);
    setSelectedSource(source);
    setConfirmOpen(true);
  }

  function openReject(student) {
    setSelectedStudent(student);
    setRejectOpen(true);
  }

  async function handleApprove() {
    if (!selectedStudent) return;
    const student = selectedStudent;
    setConfirmOpen(false);
    setSelectedStudent(null);

    try {
      await approveStudent(student, userProfile.uid);

      if (selectedSource === "pending") {
        setPendingStudents((prev) => prev.filter((s) => s.uid !== student.uid));
      } else {
        setRejectedStudents((prev) =>
          prev.filter((s) => s.uid !== student.uid)
        );
      }

      showAlert(
        `Student "${student.name}" has been approved${
          selectedSource === "rejected" ? " again" : ""
        }.`
      );
    } catch (err) {
      console.error(err);
      showAlert(`Failed to approve student: ${err.message || err}`);
    } 
  }

  async function handleReject() {
    if (!selectedStudent) return;
    const student = selectedStudent;

    try {
      await rejectStudent(student, userProfile.uid);
      setPendingStudents((prev) => prev.filter((s) => s.uid !== student.uid));
      showAlert(`Student "${student.name}" has been rejected.`);
    } catch (err) {
      console.error(err);
      showAlert(`Failed to reject student: ${err.message || err}`);
    } finally {
      setRejectOpen(false);
      setSelectedStudent(null);
    }
  }

  const currentList =
    activeTab === "pending" ? pendingStudents : rejectedStudents;

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Manage Student Registrations
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Review new student registrations and manage approvals.
          </p>
        </div>
      </div>

      <div className="border-b mb-4 flex gap-4">
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-2 text-sm font-medium transition-all duration-200 ${
            activeTab === "pending"
              ? "border-b-2 border-blue-600 text-blue-700"
              : "text-slate-500 hover:text-slate-700 hover:border-b-2 hover:border-slate-300"
          }`}
        >
          Pending ({pendingStudents.length})
        </button>

        <button
          onClick={() => setActiveTab("rejected")}
          className={`pb-2 text-sm font-medium transition-all duration-200 ${
            activeTab === "rejected"
              ? "border-b-2 border-rose-600 text-rose-700"
              : "text-slate-500 hover:text-slate-700 hover:border-b-2 hover:border-slate-300"
          }`}
        >
          Rejected ({rejectedStudents.length})
        </button>
      </div>

      {loading ? (
        <p>Loading students...</p>
      ) : currentList.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-6 text-center text-slate-500">
          {activeTab === "pending"
            ? "No pending student registrations."
            : "No rejected students."}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <div className="overflow-x-auto max-w-full border rounded-xl">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-slate-100 text-slate-600 sticky top-0 z-10">
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
                {currentList.map((s) => (
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
                      <div className="flex gap-2 w-full">
                        <button
                          onClick={() =>
                            openApprove(
                              s,
                              activeTab === "pending" ? "pending" : "rejected"
                            )
                          }
                          className="w-full flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition"
                        >
                          {activeTab === "pending"
                            ? "Approve"
                            : "Approve Again"}
                        </button>

                        {activeTab === "pending" && (
                          <button
                            onClick={() => openReject(s)}
                            className="w-full flex-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 text-white hover:bg-red-700 transition"
                          >
                            Reject
                          </button>
                        )}
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
        <p className="text-sm text-slate-700">
          Do you want to{" "}
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
            {selectedStudent?.email}). This will prevent them from logging in
            until approved again.
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
