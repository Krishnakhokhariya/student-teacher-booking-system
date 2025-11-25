import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

export async function addLog(data) {
    return addDoc(collection(db, "logs"),{
        ...data,
        createdAt: new Date()
    });
    
}