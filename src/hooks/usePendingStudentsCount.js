import { useEffect, useState } from "react";
import { getPendingStudents } from "../utils/studnets";

export function usePendingStudentsCount(){
    const [pendingCount, setPendingCount] = useState(0);

    async function load(){
        try{
            const list = await getPendingStudents();
            setPendingCount(list.length);
        } catch(err){
            console.error("Failed to load pending students count:", err);
        }
    }
    useEffect(() => {
        load();
    },[]);

    return {pendingCount, reloadPendingCount: load};
}