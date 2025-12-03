import { db } from "../firebase/firebaseConfig";
import { 
    collection,
    addDoc,
    getDocs,
    query,
    where,
    orderBy,
    updateDoc,
    doc,
    writeBatch,
    serverTimestamp,
 } from "firebase/firestore";

 export async function addNotifications({
    toUid,
    toName,
    fromUid,
    fromName,
    type,
    message,
    roleTarget,
 }){
    const ref = collection(db, "notifications");
    await addDoc(ref, {
        toUid,
        toName: toName || "",
        fromUid: fromUid || "system",
        fromName: fromName || "System",
        type,
        message,
        roleTarget: roleTarget || null,
        read: false,
        createdAt: serverTimestamp(),
    });
 }

 export async function markNotificationRead(notificationId){
    const ref = doc(db, "notifications", notificationId);
    await updateDoc(ref, {read: true});
 }

 export async function getNotificationsForUser(userUid){
    const ref = collection(db, "notifications");
    const q = query(
        ref,
        where("toUid", "==", userUid),
        orderBy("createdAt", "desc")
    );

    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
    }));
 }

 export async function getUnreadNotificationCount(userUid){
    const ref = collection(db, "notifications");
    const q = query(
        ref,
        where("toUid", "==", userUid),
        where("read", "==", false)
    );
    const snap = await getDocs(q);
    return snap.size;
 } 

 export async function markAllNotificationsRead(userUid){
    const ref = collection(db, "notifications");
    const q = query(
        ref,
        where("toUid", "==", userUid),
        where("read", "==", false)
    );

    const snap = await getDocs(q);
    if(snap.empty) return;

    const batch = writeBatch(db);
    snap.docs.forEach((docSnap) => {
        batch.update(docSnap.ref, {read: true});
    });

    await batch.commit();
 }