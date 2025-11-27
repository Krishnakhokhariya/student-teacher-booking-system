import { db } from "../firebase/firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function getAdminStatus(){
    const userRef = collection(db, "users");

    const teacherSnap = await getDocs(
        query(userRef, where("role","==","teacher"))
    );

    const approvedSanp = await getDocs(
        query(userRef, 
            where("role","==","student"),
            where("status","==","approved")
        )
    );

     const rejectedSanp = await getDocs(
        query(userRef, 
            where("role","==","student"),
            where("status","==","rejected")
        )
    );

     const pendingSanp = await getDocs(
        query(userRef, 
            where("role","==","student"),
            where("status","==","pending")
        )
    );

    return {
        totalTeacher: teacherSnap.size,
        totalApproved: approvedSanp.size,
        totalRejected: rejectedSanp.size,
        totalPending: pendingSanp.size
    };

}

export async function getRecentLogs(limitCount = 5){
    const logSnap = await getDocs(collection(db, "logs"));
    const allLogs = logSnap.docs
    .map((d) => d.data())
    .sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;  
    });

    return allLogs
    .slice(0, limitCount);
}