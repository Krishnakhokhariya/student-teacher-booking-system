import { db } from "../firebase/firebaseConfig";
import { 
    collection,
    addDoc,
    serverTimestamp,
    query,
    where, 
    getDocs,
    writeBatch,
 } from "firebase/firestore";
 import { addLog } from "./logger";

 const MESSAGES_COLLECTION = "messages";
const USERS_COLLECTION = "users";

 export async function sendMessage({fromUid, fromName, toUid, toName, message}){
    const ref = collection(db, MESSAGES_COLLECTION);
    await addDoc(ref, {
        fromUid,
        fromName,
        toUid,
        toName,
        message,
        createdAt: serverTimestamp(),
        read: false,
    });
    await addLog({
    action: "message_sent",
    message: `${fromName} sent message to ${toName}`,
    by: fromUid,
  });
 }

 export async function getConversation(user1, user2){
    const ref = collection(db, MESSAGES_COLLECTION);

    const q1 = query(ref,
        where("fromUid", "==", user1),
        where("toUid", "==", user2)
    );

    const q2 = query(ref,
        where("fromUid", "==", user2),
        where("toUid", "==", user1)
    )

    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

    const data = [
        ...snap1.docs.map(d => ({id: d.id, ...d.data()})),
        ...snap2.docs.map(d => ({id: d.id, ...d.data()}))
    ];

    return data.sort((a, b) => {
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return aTime - bTime;
  });
 }

 export async function getConversationPartners(currentUid, currentRole) {
  const usersRef = collection(db, USERS_COLLECTION);

  let q;
  if (currentRole === "student") {
    q = query(usersRef, where("role", "==", "teacher"));
  } else if (currentRole === "teacher") {
    q = query(usersRef, where("role", "==", "student"));
  } else {
    q = query(usersRef, where("uid", "!=", currentUid));
  }

  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    uid: d.id,
    ...d.data(),
  }));
}

export async function getUnreadCounts(currentUid) {
  const ref = collection(db, MESSAGES_COLLECTION);
  const q = query(
    ref,
    where("toUid", "==", currentUid),
    where("read", "==", false)
  );

  const snap = await getDocs(q);

  const counts = {};
  snap.forEach((docSnap) => {
    const data = docSnap.data();
    const fromUid = data.fromUid;
    if (!fromUid) return;
    counts[fromUid] = (counts[fromUid] || 0) + 1;
  });

  return counts; 
}

export async function markConversationRead(currentUid, partnerUid) {
  const ref = collection(db, MESSAGES_COLLECTION);
  const q = query(
    ref,
    where("fromUid", "==", partnerUid),
    where("toUid", "==", currentUid),
    where("read", "==", false)
  );

  const snap = await getDocs(q);

  if (snap.empty) return;

  const batch = writeBatch(db);
  snap.docs.forEach((docSnap) => {
    batch.update(docSnap.ref, { read: true });
  });

  await batch.commit();
}

function getLastMessageTimestampWith(contactUid) {
  const msgs = messagesMap[contactUid] || [];
  if (msgs.length === 0) return 0;
  return msgs[msgs.length - 1].createdAt?.seconds || 0;
}