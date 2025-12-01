import { useEffect, useState } from 'react'
import { db } from '../firebase/firebaseConfig'
import { collection, onSnapshot, query, where } from 'firebase/firestore'

function useUnreadMessageCount(currentUid) {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if(!currentUid) return;
        const ref = collection(db, "messages");

        const q = query(ref,
            where("toUid", "==", currentUid),
            where("read", "==", false)
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            const uniqueSenders = new Set();

            snap.docs.forEach((d) =>{
                uniqueSenders.add(d.data().fromUid)
            })
            setUnreadCount(uniqueSenders.size);
        });
        return () => unsubscribe();
    }, [currentUid]);
  return { unreadCount };
}

export default useUnreadMessageCount
