import React, { useEffect, useState } from "react";
import AdminLayout from "../../../layouts/AdminLayout";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../../context/AuthContext";
import { getTeachers, addTeacher, updateTeacher, deleteTeacher } from "../../../utils/teachers";
import TeacherForm from "./TeacherForm";
import DeleteConfirm from "../../../components/DeleteConfirm";

function ManageTeacher() {
  const {userProfile} = useAuth();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [subject, setSubject] = useState("");
  const [password, setPassword] = useState("");

  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const list = await getTeachers();
    setTeachers(list);
    setLoading(false);
  }

  function openAddModal(){
    setEditingId(null);
    setName("");
    setEmail("");
    setDepartment("");
    setSubject("");
    setPassword("");

    setFormOpen(true);
  }

  function openEditModal(t){
    setEditingId(t.uid);
    setName(t.name);
    setEmail(t.email);
    setDepartment(t.department);
    setSubject(t.subject);

    setFormOpen(true);
  }

  async function handleSubmit(){
    if(!name || !email || !password || !department || !subject) return;
   if(!editingId && password.length < 6){
    alert("Password must be at least 6 characters");
    return;
   }
   
    if(editingId){
      await updateTeacher(editingId,{
        name,
        password,
        department,
        subject,
      }, userProfile.uid)

      setTeachers((old) =>
        old.map((t) =>
          t.uid === editingId ? { ...t, name, department, subject } : t
        )
      );
    } else{
      const uid = await addTeacher({
        name,
          email,
          password,
          department,
          subject,
          adminId: userProfile.uid,
      });

      setTeachers((old) => [
        ...old,
        {uid, name,email,department,subject},
      ]);
    }
    setFormOpen(false);
  }

   function openDeleteModal(uid, name) {
    setDeleteId(uid);
    setDeleteName(name);
    setDeleteOpen(true);
  }

   async function handleDelete() {
    await deleteTeacher(deleteId, deleteName, userProfile.uid);
    setTeachers((old) => old.filter((t) => t.uid !== deleteId));
    setDeleteOpen(false);
  }


  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">
          Manage Teachers
        </h1>
        <button onClick={openAddModal} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
          + Add Teacher
        </button>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : teachers.length === 0 ? (
        <p>No teacher found</p>
      ) : (
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-slate-100 text-slate-700">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t) => (
              <tr key={t.uid} className="border-b hover:bg-slate-50">
                <td className="p-3">{t.name}</td>
                <td className="p-3">{t.email}</td>
                <td className="p-3">{t.department}</td>
                <td className="p-3">{t.subject}</td>
                <td className="p-3 flex gap-2">
                
                  <button key={t.uid + "-edit"}  onClick={()=> openEditModal(t)} className="text-indigo-600 hover:scale-125 transition">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button key={t.uid + "-delete"}  onClick={() => openDeleteModal(t.uid, t.name)} className="text-red-600 hover:scale-125 transition">
                   <TrashIcon className="w-5 h-5" />
                  </button>
                
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <TeacherForm 
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        department={department}
        setDepartment={setDepartment}
        subject={subject}
        setSubject={setSubject}
        isEdit={!!editingId} />

       <DeleteConfirm
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDelete={handleDelete}
        teacherName={deleteName}
      />
     
    </AdminLayout>
  );
}

export default ManageTeacher;
