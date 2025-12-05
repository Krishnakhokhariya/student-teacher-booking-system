import React, { useEffect, useState } from "react";
import AdminLayout from "../../../layouts/AdminLayout";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../../context/AuthContext";
import Modal from "../../../components/Modal";
import {
  getTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
} from "../../../utils/teachers";
import TeacherForm from "./TeacherForm";
import DeleteTeacherConfirm from "../../../components/DeleteTeacherConfirm";

function ManageTeacher() {
  const { userProfile } = useAuth();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [subject, setSubject] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");

  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {
    setLoading(true);
    try {
      const list = await getTeachers();
      setTeachers(list);
    } finally {
      setLoading(false);
    }
  }

  function showAlert(msg) {
    setAlertMsg(msg);
    setAlertOpen(true);
  }

  function openAddModal() {
    setEditingId(null);
    setName("");
    setEmail("");
    setDepartment("");
    setSubject("");

    setFormOpen(true);
  }

  function openEditModal(t) {
    setEditingId(t.uid);
    setName(t.name);
    setEmail(t.email);
    setDepartment(t.department);
    setSubject(t.subject);

    setFormOpen(true);
  }

  async function handleSubmit() {
    if (!name || !email || !department || !subject) {
      showAlert("Please fill all fields.");
      return;
    }

    try {
      if (editingId) {
        await updateTeacher(
          editingId,
          {
            name,
            department,
            subject,
          },
          userProfile.uid
        );

        setTeachers((prev) =>
          prev.map((t) =>
            t.uid === editingId ? { ...t, name, department, subject } : t
          )
        );
      } else {
        const uid = await addTeacher({
          name,
          email,
          department,
          subject,
          adminId: userProfile.uid,
        });

        setTeachers((prev) => [
          ...prev,
          { uid, name, email, department, subject },
        ]);
        showAlert(
          `Teacher added. A password setup email has been sent to ${email}.`
        );
      }
      setFormOpen(false);
    } catch (err) {
      console.error(err);
      showAlert("Failed to update teacher: " + (err.message || err));
    }
  }

  function openDeleteModal(uid, name) {
    setDeleteId(uid);
    setDeleteName(name);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    try {
      await deleteTeacher(deleteId, deleteName, userProfile.uid);
      setTeachers((prev) => prev.filter((t) => t.uid !== deleteId));
      setDeleteOpen(false);
    } catch (err) {
      console.error(err);
      showAlert(
        "Failed to delete teacher. You might not have permission: " +
          (err.message || err)
      );
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6 bg-white p-4 shadow rounded-lg">
        <h1 className="text-2xl font-bold text-gray-800">Manage Teachers</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gray-800 px-4 py-2 text-white rounded-lg shadow hover:bg-gray-900 transition"
        >
          <PlusIcon className="h-5 w-5" />
        </button>
      </div>

      {loading && <p className="text-gray-600 text-center">Loading...</p>}
      {!loading && teachers.length === 0 && (
        <p className="text-gray-600 text-center">No teachers found</p>
      )}

      <div className="space-y-4 pb-10">
        {teachers.map((t) => (
          <div
            key={t.uid}
            className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold text-gray-900 text-wrap">{t.name}</p>
              <p className="text-gray-700 text-sm">{t.email}</p>

              <p className="text-gray-600 text-sm mt-1 text-wrap">
                <span className="font-semibold">Department: </span>
                {t.department}
              </p>

              <p className="text-gray-600 text-sm text-wrap">
                <span className="font-semibold">Subject: </span>
                {t.subject}
              </p>
            </div>

            <div className="flex sm:flex-col flex-row gap-4 sm:ml-4 justify-end">
              <button
                onClick={() => openEditModal(t)}
                className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
              >
                <PencilIcon className="w-6 h-6" />
              </button>

              <button
                onClick={() => openDeleteModal(t.uid, t.name)}
                className="text-red-600 hover:text-red-900 flex items-center gap-1"
              >
                <TrashIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <TeacherForm
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        department={department}
        setDepartment={setDepartment}
        subject={subject}
        setSubject={setSubject}
        isEdit={!!editingId}
      />

      <DeleteTeacherConfirm
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDelete={handleDelete}
        teacherName={deleteName}
      />
      <Modal
        isOpen={alertOpen}
        title="Notification"
        primaryLabel="OK"
        onPrimaryClick={() => setAlertOpen(false)}
        onClose={() => setAlertOpen(false)}
      >
        <p className="text-gray-700">{alertMsg}</p>
      </Modal>
    </AdminLayout>
  );
}

export default ManageTeacher;