import { db } from "../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export async function queueStatusEmail({ toEmail, toName, status, reason }) {
  if (!toEmail) return;

  let subject = "";
  let body = "";

  if (status === "approved") {
    subject = "Your Student Account Has Been Approved";
    body =
      `Hi ${toName || "Student"},\n\n` +
      `Good news! Your student account has been APPROVED.\n\n` +
      `You can now log in and book appointments.\n\n` +
      `Thank you,\nAdmin Team\n`;
  }

  if (status === "rejected") {
    subject = "Your Student Registration Was Rejected";
    body = `Hi ${toName || "Student"},\n\n` +
      `Unfortunately, your registration was NOT approved.\n\n` +
      `Reason: ${reason || "No reason provided"}\n\n` +
      `If you believe this was a mistake, please contact admin.\n\n` +
      `Thank you,\nAdmin Team\n`;
  }

  const mailRef = collection(db, "mail");

  await addDoc(mailRef,{
    to: toEmail,
    message:{
        subject,
        text: body,
    }, 
    createdAt: serverTimestamp(),
    type: "status_update",
  })
}
