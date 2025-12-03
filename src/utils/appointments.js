import { db } from "../firebase/firebaseConfig";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { addLog } from "./logger";
import { addNotifications } from "./notifications";

export async function createAppointment({
  teacherUid,
  teacherName,
  studentUid,
  studentName,
  date,
  slot,
  purpose,
}) {
  const ref = collection(db, "appointments");
  const docRef = await addDoc(ref, {
    teacherUid,
    teacherName,
    studentUid,
    studentName,
    date,
    slot,
    purpose,
    status: "pending",
    createdAt: serverTimestamp(),
  });

   await addNotifications({
    toUid: teacherUid,
    toName: teacherName,
    fromUid: studentUid,
    fromName: studentName,
    type: "appointment_created",
    roleTarget: "teacher",
    message: `New appointment request from ${studentName} on ${date} (${slot}).`,
  });

   await addLog({
    action: "appointment_created",
    message: `Student ${studentName} requested appointment with ${teacherName} on ${date} (${slot}).`,
    by: studentUid,
  });

  return docRef.id;

}

export async function getAppoinmentsForStudnet(studnentUid){
    const ref = collection(db, "appointments");
    const q = query(ref, 
        where("studentUid", "==", studnentUid));
        const snap = await getDocs(q);

        return snap.docs.map((d) => ({
            id:d.id,
            ...d.data(),
        }));
}