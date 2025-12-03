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
import { addNotifications } from "./notifications";

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

  await addNotifications({
    toUid: app.studentUid,
    toName: app.studentName,
    fromUid: teacherUid,
    fromName: app.teacherName,
    type: "appointment_approved",
    roleTarget: "student",
    message: `Your appointment with ${app.teacherName} on ${app.date} has been approved.`,
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

  await addNotifications({
    toUid: app.studentUid,
    toName: app.studentName,
    fromUid: teacherUid,
    fromName: app.teacherName,
    type: "appointment_rejected",
    roleTarget: "student",
    message: `Your appointment request with ${app.teacherName} on ${app.date} has been rejected.`,
  });
}
