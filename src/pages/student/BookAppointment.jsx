// src/pages/student/BookAppointment.jsx
import React, { useEffect, useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { createAppointment } from "../../utils/appointments";
import Modal from "../../components/Modal";
import { getFormattedAvailability } from "../../utils/availability";

export default function BookAppointment() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [teacher, setTeacher] = useState(location.state?.teacher || null);
  const [loadingTeacher, setLoadingTeacher] = useState(false);
  const [availability, setAvailability] = useState([]);

  const [selected, setSelected] = useState({ date: "", slot: "" });
  const [purpose, setPurpose] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const teacherId = searchParams.get("teacherId");

  useEffect(() => {
    async function loadTeacher() {
      if (!teacherId) return;

      try {
        if (!teacher) {
          setLoadingTeacher(true);
          const ref = doc(db, "users", teacherId);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setTeacher({ uid: snap.id, ...snap.data() });
          } else {
            setErrorMsg("Teacher not found.");
            setErrorOpen(true);
          }
        }
        const slots = await getFormattedAvailability(teacherId);
        setAvailability(slots);
      } catch (err) {
        console.error("Failed to load teacher", err);
        setErrorMsg("Failed to load teacher details.");
        setErrorOpen(true);
      } finally {
        setLoadingTeacher(false);
      }
    }
    loadTeacher();
  }, [teacher, teacherId]);

  if (!userProfile || userProfile.role !== "student") {
    return (
      <StudentLayout>
        <div className="bg-white rounded-xl p-6 shadow border text-sm text-red-600">
          You must be logged in as a student to book appointments.
        </div>
      </StudentLayout>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!teacher) {
      setErrorMsg("Teacher information is missing.");
      setErrorOpen(true);
      return;
    }

    if (!selected || !purpose.trim()) {
      setErrorMsg("Please fill all fields (date, time slot, purpose).");
      setErrorOpen(true);
      return;
    }

    setSubmitting(true);
    try {
      await createAppointment({
        teacherUid: teacher.uid,
        teacherName: teacher.name,
        studentUid: userProfile.uid,
        studentName: userProfile.name,
        studentEmail: userProfile.email,
        date: selected.date,
        slot: selected.slot,
        purpose: purpose.trim(),
      });

      setSuccessOpen(true);
      setSelected({date: "", slot: ""});
      setPurpose("");
    } catch (err) {
      console.error("Failed to create appointment", err);
      setErrorMsg(err.message || "Failed to create appointment.");
      setErrorOpen(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <StudentLayout>
      <div className="max-w-xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Book Appointment
          </h1>
          <p className="text-sm text-gray-600 mt-1">
           Select an available date and slots for {" "}
            <span className="font-semibold">
              {teacher?.name ||
                (loadingTeacher ? "loading..." : "selected teacher")}
            </span>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
          {loadingTeacher ? (
            <p className="text-sm text-gray-500">Loading teacher...</p>
          ) : !teacher ? (
            <p className="text-sm text-red-600">
              No teacher selected. Please go back to{" "}
              <button
                onClick={() => navigate("/student/search-teacher")}
                className="underline text-gray-800"
              >
                Search Teachers
              </button>
              .
            </p>
          ) : (
            <>
              <div className="mb-4 border-b border-gray-200 pb-3">
                <h2 className="text-base font-semibold text-gray-800">
                  {teacher.name}
                </h2>
                <p className="text-xs text-gray-500">
                  {teacher.department || "Department N/A"} •{" "}
                  {teacher.subject || "Subject N/A"}
                </p>
                <p className="mt-1 text-xs text-gray-500 break-all">
                  {teacher.email}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold mb-2">Available Slots</p>

                {availability.length === 0 ? (
                  <p className="text-xs text-gray-500">No availability added.</p>
                ) : (
                  availability.map((day) => (
                    <div key={day.date} className="mb-4">
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        {day.formattedDate}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {day.slots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() =>
                              setSelected({ date: day.date, slot: slot })
                            }
                            className={`px-2 py-1 rounded-full border text-xs transition
                            ${
                              selected.date === day.date &&
                              selected.slot === slot
                                ? "bg-gray-900 text-white border-gray-900"
                                : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Purpose
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-800 focus:outline-none min-h-[80px]"
                    placeholder="Describe why you want to meet (e.g. discuss project, get feedback, assignment help)"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => navigate("/student/search-teacher")}
                    className="px-4 py-1.5 text-sm rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-1.5 text-sm rounded-full bg-gray-900 text-white hover:bg-black disabled:opacity-60"
                  >
                    {submitting ? "Booking..." : "Book Appointment"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        <Modal
          isOpen={successOpen}
          title="Appointment Requested"
          primaryLabel="OK"
          onPrimaryClick={() => {
            setSuccessOpen(false);
            navigate("/student/my-appointments");
          }}
          onClose={() => setSuccessOpen(false)}
        >
          <p className="text-sm text-gray-700">
            Your appointment request has been submitted and is currently{" "}
            <span className="font-semibold">pending approval</span> from the
            teacher.
          </p>
        </Modal>

        <Modal
          isOpen={errorOpen}
          title="Error"
          onClose={() => setErrorOpen(false)}
        >
          <p className="text-sm text-red-600">{errorMsg}</p>
        </Modal>
      </div>
    </StudentLayout>
  );
}
