import Modal from "./Modal";
import React from 'react'

export default function DeleteTeacherConfirm({
    isOpen,
    onClose,
    onDelete,
    teacherName,
}) {
  return (
    <Modal
    isOpen={isOpen}
    title="Delete Teacher?"
    primaryLabel="Delete"
    onPrimaryClick={onDelete}
    onClose={onClose}>
        <p className="text-sm text-gray-700">Are you sure to delete {" "}
            <span className="font-semibold">{teacherName}</span>?
            <br/>
            This action cannot be undone.
        </p>

    </Modal>
  );
}

 
