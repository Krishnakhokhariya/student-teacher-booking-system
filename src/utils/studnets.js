import { db } from "../firebase/firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  setDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { addLog } from "./logger";
import { queueStatusEmail } from "./emailNotifications";
import { sendStatusEmail } from "./sendEmail";

export async function getPendingStudents() {
  const usersRef = collection(db, "users");
  const q = query(
    usersRef,
    where("role", "==", "student"),
    where("status", "==", "pending")
  );
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    uid: d.id,
    ...d.data(),
  }));
}

async function notifyStudent({ toUserId, toName, type, message }) {
  const messageRef = collection(db, "messages");

  await addDoc(messageRef, {
    fromUserId: "system",
    fromName: "System",
    toUserId,
    toName: toName || "",
    subject:
      type === "approved"
        ? "Account Approved"
        : type === "rejected"
        ? "Account Rejected"
        : "Notification",
    message,
    type,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function approveStudent(student, adminId) {
  const userRef = doc(db, "users", student.uid);

  await setDoc(
    userRef,
    {
      status: "approved",
      approvedAt: serverTimestamp(),
      approvedBy: adminId,
    },
    { merge: true }
  );

  await addLog({
    action: "studnet_reg_approved",
    message: `Approved studnet ${student.name} (${student.email})`,
    by: adminId,
  });


  await sendStatusEmail({
  toEmail: student.email,
  toName: student.name,
  subject: "Your Student Account Has Been Approved",
  body: "Your account is now active. You can log in and book appointments.",
});
}

export async function rejectStudent(student, adminId) {
  const userRef = doc(db, "users", student.uid);

  await setDoc(
    userRef,
    {
      status: "rejected",
      rejectedAt: serverTimestamp(),
      rejectedBy: adminId,
    },
    { merge: true }
  );

  await addLog({
    action: "student_rejected",
    message: `Rejected student ${student.name} (${student.email}).`,
    by: adminId,
  });

  await sendStatusEmail({
  toEmail: student.email,
  toName: student.name,
  subject: "Your Student Registration Was Rejected",
  body: "Your registration was not approved.",
});
}
