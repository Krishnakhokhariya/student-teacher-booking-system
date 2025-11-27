import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    async function load() {
      const snap = await getDocs(collection(db, "logs"));
      const data = snap.docs
        .map((d) => d.data())
        .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
      setLogs(data);
    }
    load();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">System Logs</h1>

      <div className="bg-white shadow-md rounded-xl overflow-hidden">
         <div className="overflow-x-auto max-w-full border rounded-xl">
           <table className="min-w-[900px] w-full text-sm">
             <thead className="bg-slate-100 text-slate-600 sticky top-0 z-10">
              <tr>
                <th className="p-3 text-left">Action</th>
                <th className="p-3 text-left">Message</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">Time</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-slate-50">
                  <td className="p-3 font-semibold">{log.action}</td>
                  <td className="p-3">{log.message}</td>
                  <td className="p-3">{log.by || "-"}</td>
                  <td className="p-3 text-slate-600 whitespace-nowrap">
                    {log.createdAt?.toDate
                      ? log.createdAt.toDate().toLocaleString('en-In')
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
    </AdminLayout>
  );
}
