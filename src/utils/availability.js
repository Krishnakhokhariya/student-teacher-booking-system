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

 export async function getTeacherAvailability(teacherId){
    const ref = collection(db, "teachers", teacherId, "availability");
    const snap = await getDocs(ref);

    return snap.docs.map((d) =>({
        id: d.id,
        ...d.data(),
    }));
 }

 export async function addDate(teacherId, date){
    const ref = doc(db,"teachers", teacherId, "availability", date);

    await setDoc(ref,
        {
            date,
            slots: [],
            createdAt: serverTimestamp(),
        }, 
        {merge: true}
    );

    await addLog({
        action: "Date_added",
        message: `Teacher added availability date: ${date}`,
        by: teacherId,
    });
 }

 export async function addSlot(teacherId,date, timeSlot){
    const ref = doc(db,"teachers", teacherId, "availability", date);

    await updateDoc(ref,{
        slots: arrayUnion(timeSlot),
        updatedAt: serverTimestamp(),
    });

    await addLog({
        action: "slot_added",
        message: `Teacher added slot ${timeSlot} on ${date}`,
        by: teacherId,
    });
 }

 export async function removeSlot(teacherId, date, timeSlot){
    const ref = doc(db, "teachers", teacherId, "availability", date);

    await updateDoc(ref,{
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