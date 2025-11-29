import React, { useEffect, useState } from "react";
import TeacherLayout from "../../layouts/TeacherLayout";
import { getFormattedAvailability } from "../../utils/availability";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/Modal";
import {
  TrashIcon,
  CalendarDaysIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";


const SLOT_OPTIONS = [
  "9AM - 10AM",
  "10AM - 11AM",
  "11AM - 12PM",
  "12PM - 1PM",
  "1PM - 2PM",
  "2PM - 3PM",
  "3PM - 4PM",
  "4PM - 5PM",
];

export default function TeacherSchedule() {
  const { userProfile } = useAuth();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [availability, setAvailability] = useState([]);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteType, setDeleteType] = useState("");
  const [targetDate, setTargetDate] = useState(null);
  const [targetSlot, setTargetSlot] = useState(null);

  useEffect(() => {
    loadAvailability();
  }, []);

  async function loadAvailability() {
    // const ref = collection(db, "teachers", userProfile.uid, "availability");
    // const snap = await getDocs(ref);

    // const raw = snap.docs.map((d) => ({
    //   id: d.id,
    //   ...d.data(),
    // }));

    // const grouped = raw.reduce((acc, item) => {
    //   if (!acc[item.date]) acc[item.date] = [];
    //   acc[item.date].push(item);
    //   return acc;
    // }, {});
    // const formatted = Object.keys(grouped).map((date) => ({
    //   date,
    //   slots: grouped[date].sort(
    //     (a, b) => parseSlot(a.slot) - parseSlot(b.slot)
    //   ),
    // }));

    // const today = new Date();
    // today.setHours(0, 0, 0, 0);

    // formatted.sort((a, b) => {
    //   const da = new Date(a.date);
    //   const db = new Date(b.date);

    //   if (da >= today && db >= today) return da - db;
    //   if (da >= today && db < today) return -1;
    //   if (da < today && db >= today) return 1;
    //   return da - bd;
    // });

    const formatted = await getFormattedAvailability(userProfile.uid);

    setAvailability(formatted);
  }

  async function addAvailability() {
    if (!selectedDate || !selectedSlot) return;

    const dateEntry = availability.find((d) => d.date === selectedDate);

    if (dateEntry) {
      const duplicate = dateEntry.slots.some((s) => s.slot === selectedSlot);
      if (duplicate) {
        showAlert("This slot is already added for this date.");
        return;
      }
    }

    await addDoc(collection(db, "teachers", userProfile.uid, "availability"), {
      date: selectedDate,
      slot: selectedSlot,
      createdAt: new Date(),
    });

    setSelectedDate("");
    setSelectedSlot("");
    setDropdownOpen(false);

    await loadAvailability();
  }

  function confirmDeleteDate(dateObj) {
    setDeleteType("date");
    setTargetDate(dateObj);
    setConfirmOpen(true);
  }
  function confirmDeleteSlot(dateObj, slotObj) {
    setDeleteType("slot");
    setTargetDate(dateObj);
    setTargetSlot(slotObj);
    setConfirmOpen(true);
  }

  function showAlert(msg) {
    setAlertMessage(msg);
    setAlertOpen(true);
  }

  async function handleDelete() {
    if (deleteType === "date") {
      for (let s of targetDate.slots) {
        await deleteDoc(
          doc(db, "teachers", userProfile.uid, "availability", s.id)
        );
      }
    }

    if (deleteType === "slot") {
      await deleteDoc(
        doc(db, "teachers", userProfile.uid, "availability", targetSlot.id)
      );
    }

    setConfirmOpen(false);
    await loadAvailability();
  }


  return (
    <TeacherLayout>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Manage Availability
      </h1>

      <div className="bg-white p-4 rounded-xl shadow-md border mb-6">
        <h2 className="font-semibold text-lg mb-3">Add Available Slot</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600">Select Date</label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="relative">
            <label className="text-sm text-gray-600">Select Time Slot</label>

            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="border rounded-lg px-3 py-2 mt-1 bg-white cursor-pointer"
            >
              {selectedSlot || "Choose slot"}
            </div>

            {dropdownOpen && (
              <div className="absolute z-50 bg-white border rounded-lg mt-1 shadow-lg w-full max-h-48 overflow-y-auto">
                {SLOT_OPTIONS.map((slot) => (
                  <div
                    key={slot}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedSlot(slot);
                      setDropdownOpen(false);
                    }}
                  >
                    {slot}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-end">
            <button
              onClick={addAvailability}
              className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
            >
              Add Slot
            </button>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-700 mb-3">Your Slots</h2>

      {availability.length === 0 ? (
        <div className="text-gray-500 bg-white p-4 rounded-xl border text-center">
          No availability added yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availability.map((day) => (
            <div
              key={day.date}
              className="bg-white rounded-xl p-4 shadow border hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="flex items-center text-sm text-gray-600">
                    <CalendarDaysIcon className="w-4 h-4 mr-1" />
                    Date
                  </p>
                  <p className="font-semibold text-gray-800 text-lg">
                    {day.formattedDate}
                  </p>
                </div>

                <button onClick={() => confirmDeleteDate(day)}>
                  <TrashIcon className="w-5 h-5 text-red-500 hover:text-red-800" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {day.slots.map((slot) => (
                  <div
                    key={slot}
                    className="
                        flex items-center gap-1
                        bg-gray-100 border border-gray-300 
                        text-gray-700 text-sm 
                        px-2 py-1.5
                        rounded-full
                        hover:bg-gray-200 transition"
                  >
                    <ClockIcon className="w-4 h-4" />
                    <span>{slot}</span>

                    <XMarkIcon
                      className="w-4 h-4 text-gray-500 hover:text-red-500"
                      onClick={() => confirmDeleteSlot(day, slot)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={alertOpen}
        title="Notice"
        primaryLabel="OK"
        onPrimaryClick={() => setAlertOpen(false)}
        onClose={() => setAlertOpen(false)}
      >
        <p className="text-sm text-gray-700 text-center">{alertMessage}</p>
      </Modal>
      <Modal
        isOpen={confirmOpen}
        title={deleteType === "date" ? "Delete Date?" : "Delete Slot?"}
        primaryLabel="Delete"
        onPrimaryClick={handleDelete}
        onClose={() => setConfirmOpen(false)}
      >
        <p className="text-sm text-center text-gray-700">
          {deleteType === "date"
            ? "This will delete the entire date with ALL its slots. Are you sure?"
            : "This will remove your selected tile slot. Are you sure?."}
        </p>
      </Modal>
    </TeacherLayout>
  );
}
