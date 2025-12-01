import { useEffect, useState } from "react";
import { db } from "../firebase/firebaseConfig";
import { collection, onSnapshot, query, where } from "firebase/firestore";
// import { getPendingStudents } from "../utils/studnets";

export function usePendingStudentsCount(){
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const ref = collection(db, "users");

        const q = query(ref,
            where("role", "==", "student"),
            where("status", "==", "pending")
        );

        const unsubscribe = onSnapshot(q, (snap) => {
            setPendingCount(snap.size);
        });
        return () => unsubscribe();
    }, []);
    

    return {pendingCount};
}