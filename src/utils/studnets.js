import { db } from "../firebase/firebaseConfig";
import { collection,doc,getDocs, query, where, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { addLog } from "./logger";

export async function getPendingStudents(){
    const usersRef = collection(db, "users");
    const q = query(
        usersRef,
        where("role","==","student"),
        where("status","==","pending")
    );
    const snap = await getDocs(q);

    return snap.docs.map((d) => ({
        uid: d.id,
        ...d.data(),
    }));
}

async function notifyStudent({toUserId, toName, type, message}){
    const messageRef = collection(db, "messages");

    await addDoc(messageRef,{
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

export async function approveStudent(student, adminId){
    const userRef = doc(db, "users", student.uid);

    await setDoc(userRef,{
        status:"approved",
        approvedAt: serverTimestamp(),
        approvedBy: adminId,
    },{merge: true})

    await addLog({
        action: "studnet_reg_approved",
        message: `Approved studnet ${student.name} (${student.email})`,
        by: adminId,
    });

    await notifyStudent({
        toUserId: student.uid,
        toName: student.name,
        type:"approved",
        message: "Your student account has been approved. You can now log in and use the system.",
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

  await notifyStudent({
    toUserId: student.uid,
    toName: student.name,
    type: "rejected",
    message:
      "Your registration was not approved by the admin.",
  });
}
