import emailjs from "emailjs-com";

export async function sendStatusEmail({ toEmail, toName, subject, body }) {
  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      {
        to_email: toEmail,
        toName,
        subject,
        body,
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );

    console.log("Email sent successfully");
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}
