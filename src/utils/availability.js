import { db } from "../firebase/firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";
import { addLog } from "./logger";

function parseSlot(slot) {
  const raw = slot.split("-")[0].trim();
  let hour = parseInt(raw);
  const isPM = raw.toUpperCase().includes("PM");

  if (hour === 12) {
    hour = isPM ? 12 : 0;
  } else if (isPM) {
    hour += 12;
  }
  return hour;
}

export function formatDate(dateStr) {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
}

function SortAvailability(rawList) {
  const grouped = rawList.reduce((acc, item) => {
  if (!acc[item.date]) acc[item.date] = { slots: [], raw: [] };

  acc[item.date].slots.push(item.slot); 
  acc[item.date].raw.push(item);      

  return acc;
}, {});
  let formatted = Object.entries(grouped).map(([date, data]) => ({
  date,
  formattedDate: formatDate(date),
  slots: data.slots.sort((a, b) => parseSlot(a) - parseSlot(b)),
  raw: data.raw, 
}));


  const today = new Date();
  today.setHours(0, 0, 0, 0);

  formatted.sort((a, b) => {
    const da = new Date(a.date);
    const db = new Date(b.date);

    if (da >= today && db >= today) return da - db;
    if (da >= today && db < today) return -1;
    if (da < today && db >= today) return 1;
    return da - db;
  });

  return formatted;
}

export async function getTeacherAvailability(teacherId) {
  const ref = collection(db, "teachers", teacherId, "availability");
  const snap = await getDocs(ref);

  return snap.docs.map((d) => ({
    id: d.id,
    date: d.data().date || d.id,
    ...d.data(),
  }));
}

export async function getFormattedAvailability(teacherId){
    const raw = await getTeacherAvailability(teacherId);

    return SortAvailability(raw);
}

export async function addDate(teacherId, date) {
  const ref = doc(db, "teachers", teacherId, "availability", date);

  await setDoc(
    ref,
    {
      date,
      slots: [],
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  await addLog({
    action: "Date_added",
    message: `Teacher added availability date: ${date}`,
    by: teacherId,
  });
}

export async function addSlot(teacherId, date, timeSlot) {
  const ref = doc(db, "teachers", teacherId, "availability", date);

  await updateDoc(ref, {
    slots: arrayUnion(timeSlot),
    updatedAt: serverTimestamp(),
  });

  await addLog({
    action: "slot_added",
    message: `Teacher added slot ${timeSlot} on ${date}`,
    by: teacherId,
  });
}

export async function removeSlot(teacherId, date, timeSlot) {
  const ref = doc(db, "teachers", teacherId, "availability", date);

  await updateDoc(ref, {
    slots: arrayRemove(timeSlot),
    updatedAt: serverTimestamp(),
  });

  await addLog({
    action: "slot_removed",
    message: `Teacher Removed slot ${timeSlot} from ${date}`,
    by: teacherId,
  });
}

export async function deleteDate(teacherId, date) {
  const ref = doc(db, "teachers", teacherId, "availability", date);

  await deleteDoc(ref);

  await addLog({
    action: "date_deleted",
    message: `Teacher removed availability date: ${date}`,
    by: teacherId,
  });
}

