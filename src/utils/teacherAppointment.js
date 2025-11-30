import { db } from "../firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { addLog } from "./logger";

export async function getAppointmentsForTeacher(teacherUid) {
  const ref = collection(db, "appointments");
  const q = query(ref, where("teacherUid", "==", teacherUid));

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function approveAppointment(id, teacherUid, app) {
  await updateDoc(doc(db, "appointments", id), {
    status: "approved",
    approvedAt: serverTimestamp(),
  });

  await addLog({
    action: "appointment_approved",
    message: `Teacher ${app.teacherName} approved appointment with ${app.studentName} on ${app.date}.`,
    by: teacherUid,
  });
}

export async function rejectAppointment(id, teacherUid, app) {
  await updateDoc(doc(db, "appointments", id), {
    status: "rejected",
    rejectedAt: serverTimestamp(),
  });

  await addLog({
    action: "appointment_rejected",
    message: `Teacher ${app.teacherName} rejected appointment with ${app.studentName}.`,
    by: teacherUid,
  });
}
