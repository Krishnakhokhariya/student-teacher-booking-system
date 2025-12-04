import Modal from "../../../components/Modal";
import React from "react";

export default function TeacherForm({
  isOpen,
  onClose,
  onSubmit,
  loading,
  name,
  setName,
  email,
  setEmail,
  department,
  setDepartment,
  subject,
  setSubject,
  isEdit,
}) {
  return (
    <Modal
      isOpen={isOpen}
      title={isEdit ? "Edit Teacher" : "Add Teacher"}
      primaryLabel={isEdit ? "Update" : "Add"}
      onPrimaryClick={onSubmit}
      onClose={onClose}
    >
      <div className="space-y-3">
        <div>
          <label className="block text-sm text-gray-600">Full Name</label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Email</label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="teacher@example.com"
            disabled={isEdit}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Department</label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Computer Science"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Subject</label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Data Structures"
          />
        </div>
      </div>
    </Modal>
  );
}
