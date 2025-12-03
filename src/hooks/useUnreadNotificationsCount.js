import {useState, useEffect} from 'react'
import { useAuth } from '../context/AuthContext'
import { getUnreadNotificationCount } from '../utils/notifications'
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export function useUnreadNotificationsCount() {
    const {userProfile} = useAuth();
    const [count, setCount] = useState(0);

    useEffect(() => {
        if(!userProfile?.uid) return;
        const ref = collection(db, "notifications");
        const q = query(ref,
            where("toUid", "==", userProfile.uid),
            where("read", "==", false)
        );

        const unsubscribe = onSnapshot(q,(snap) => {
            setCount(snap.size);
        });
        return unsubscribe;
    },[userProfile?.uid])

  return {count};
}

