import { auth, db } from "../firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, doc, setDoc, deleteDoc, getDocs } from "firebase/firestore";
import { addLog } from "./logger";

export async function getTeachers(){
    const ref = collection(db, "users");
    const snap = await getDocs(ref);
    const teachers = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((u) => u.role === "teacher");

    return teachers;
}

export async function addTeacher(data){
    const {name,email,password, department, subject, adminId} = data;

     if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

    const userCred = await createUserWithEmailAndPassword(auth,email,password);
    const user = userCred.user;

    await setDoc(doc(db,"users", user.uid),{
        uid: user.uid,
        name,
        email,
        department,
        subject,
        role: "teacher",
        status: "approved",
        createdAt: new Date()
    });

    await addLog({
        action: "teacher_added",
        message: `Added teacher ${name}`,
        by: adminId
    });
    return user.uid;
}

export async function deleteTeacher(uid,name,adminId){
    await deleteDoc(doc(db,"users", uid))

    await addLog({
        action: "teacher_deleted",
        message: `Deleted teacher ${name}`,
        by: adminId
    });
}

export async function updateTeacher(uid, newData, adminId){
    await setDoc(doc(db,"users", uid), newData, {merge:true});

    await addLog({
        action: "teacher_updated",
        message: `Updated teacher ${newData.name}`,
        by: adminId
    });
}