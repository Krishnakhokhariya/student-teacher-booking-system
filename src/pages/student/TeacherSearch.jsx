import React, { useEffect, useMemo, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { searchTeacher } from "../../utils/teachers";
import Modal from "../../components/Modal";
import { useNavigate } from "react-router-dom";
import { getFormattedAvailability } from "../../utils/availability";

function TeacherSearch() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [availability, setAvailability] = useState([]);

  const [errorOpen, setErrorOpen] = useState(false);
  const [errormsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const list = await searchTeacher();
        setTeachers(list || []);
      } catch (err) {
        console.error("Failed to load Teachers", err);
        setErrorMsg("Failed to load Teachers, Please try again later.");
        setErrorOpen(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredTeachers = useMemo(() => {
  const term = search.toLowerCase();

  return teachers.filter((t) => {
    return (
      t.name?.toLowerCase().includes(term) ||
      t.email?.toLowerCase().includes(term) ||
      t.department?.toLowerCase().includes(term) ||
      t.subject?.toLowerCase().includes(term)
    );
  });
}, [teachers, search]);

  async function openProfile(teacher) {
    setSelectedTeacher(teacher);
    setProfileOpen(true);
    const slots = await getFormattedAvailability(teacher.uid || teacher.id);
    setAvailability(slots);
  }

  function handleBook(teacher) {
    navigate(
      `/student/book-appointment?teacherId=${teacher.uid || teacher.id}`,
      {
        state: { teacher },
      }
    );
  }

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Find Teacher
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Search and filter teachers, view profiles, and book an
              appointment.
            </p>
          </div>
          <div className="text-xs text-gray-500">
            {filteredTeachers.length} of {teachers.length} teacher visible{" "}
          </div>
        </div>
      

      <div className="bg-white shadow-sm rounded-xl p-4 border border-slate-200">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Search 
            </label>
            <input
              type="text"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-800 focus:outline-none"
              placeholder="by name, email, department or subject"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
      </div>
       {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center text-slate-500">
            Loading teachers...
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-dashed border-slate-300 p-6 text-center text-slate-500">
            No teachers found. Try changing your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeachers.map((t) => (
              <div
                key={t.uid || t.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-base font-semibold text-slate-800">
                      {t.name || "Unnamed Teacher"}
                    </h3>
                    <span className="text-xs px-2 py-1 text-center rounded-full bg-slate-100 text-slate-600">
                      {t.department || "Dept N/A"}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {t.subject || "Subject not specified"}
                  </p>

                  <p className="mt-2 text-xs text-slate-500 break-all">
                    {t.email}
                  </p>
                </div>

                <div className="border-t border-slate-100 p-3 flex gap-2">
                  <button
                    onClick={() => openProfile(t)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleBook(t)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-gray-900 text-white hover:bg-black"
                  >
                    Book Appointment
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <Modal
         isOpen={profileOpen}
         title={selectedTeacher?.name || "Teacher Profile"}
         onClose={()=> setProfileOpen(false)}
         primaryLabel="Book Appointment"
         onPrimaryClick={() => {
            if(selectedTeacher){
                handleBook(selectedTeacher)
            }
         }}>
           {selectedTeacher && (
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Department: </span>
                {selectedTeacher.department || "-"}
              </p>
              <p>
                <span className="font-semibold">Subject: </span>
                {selectedTeacher.subject || "-"}
              </p>
              <p>
                <span className="font-semibold">Email: </span>
                {selectedTeacher.email || "-"}
              </p>
              <div className="mt-5">
                <p className="font-semibold mb-2">Availability</p>

                {availability.length === 0 ? (
                  <p className="text-slate-500 text-sm">
                    No available slots.
                  </p>
                ) : (
                  availability.map((day, index) => (
                    <div key={day.date} 
                    className={`pb-3 mb-3 ${
                      index !== availability.length - 1 ? "border-b border-slate-200" : ""
                      }`}>
                      <p className="text-xs font-semibold text-slate-700 mb-1">
                        {day.formattedDate}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {day.slots.map((slot) => (
                          <span
                            key={slot}
                            className="px-2 py-1 bg-slate-100 borfer-b rounded-full text-xs"
                          >
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )} 

        </Modal>
        <Modal
          isOpen={errorOpen}
          title="Error"
          onClose={() => setErrorOpen(false)}
        >
          <p className="text-sm text-red-600">{errormsg}</p>
        </Modal>
    </div>
    </StudentLayout>
  );
}

export default TeacherSearch;
