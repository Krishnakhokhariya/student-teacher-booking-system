import {useEffect, useState} from 'react'
import { db } from '../firebase/firebaseConfig'
import { collection, onSnapshot, query, where } from 'firebase/firestore'

function usePendingAppointmentsCount(teacherUid) {
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if(!teacherUid) return;

        const ref = collection(db, "appointments");
        const q = query(ref,
            where("teacherUid", "==", teacherUid),
            where("status", "==", "pending")
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            setPendingCount(snap.size);
        });

        return () => unsubscribe();
    },[teacherUid]);
  return { pendingCount };
}

export default usePendingAppointmentsCount
