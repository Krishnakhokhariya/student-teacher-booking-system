import { auth, db, firebaseConfig } from "../firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import { addLog } from "./logger";

function getSecondaryAuth() {
  let app;
  const existing = getApps().find((a) => a.name === "secondary");

  if (existing) {
    app = existing;
  } else {
    app = initializeApp(firebaseConfig, "secondary");
  }

  return getAuth(app);
}

export async function getTeachers() {
  const ref = collection(db, "users");
  const snap = await getDocs(ref);
  const teachers = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((u) => u.role === "teacher");

  return teachers;
}

export async function addTeacher({ name, email, department, subject, adminId }) {

 if (!name || !email) {
    throw new Error("Name and email are required");
  }

  const secondaryAuth = getSecondaryAuth();
  let createdUid = null;

  try{
    const tempPassword = Math.random().toString(36).slice(-8)+"A1";

    const userCred = await createUserWithEmailAndPassword(
        secondaryAuth,
        email,
        tempPassword
    );

    const user = userCred.user;
    createdUid = user.uid;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      name,
      email,
      department,
      subject,
      role: "teacher",
      status: "approved", 
      createdAt: serverTimestamp(),
    });

    await sendPasswordResetEmail(auth, email);

    await addLog({
      action: "teacher_added",
      message: `Added teacher ${name} and sent password setup email`,
      by: adminId,
    });
    return user.uid
  }
  finally {
    try {
      await signOut(secondaryAuth);
    } catch (e) {
     
    }
  }
}


export async function deleteTeacher(uid, name, adminId) {
  await deleteDoc(doc(db, "users", uid));

  await addLog({
    action: "teacher_deleted",
    message: `Deleted teacher ${name}`,
    by: adminId,
  });
}

export async function updateTeacher(uid, newData, adminId) {
  const safeData = { ...newData };
  delete safeData.uid;
  delete safeData.role;
  delete safeData.status;

  await setDoc(doc(db, "users", uid), safeData, { merge: true });

  await addLog({
    action: "teacher_updated",
    message: `Updated teacher ${newData.name}`,
    by: adminId,
  });
}

export async function searchTeacher(){
  return await getTeachers();
  // const all = await getTeachers();
  // return all.filter((t) => t.role === "teacher" || !t.role ? true: true);
}