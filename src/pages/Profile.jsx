import React, { useEffect, useState } from "react";
import AppLayout from "../layouts/AppLayout";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import { db, auth } from "../firebase/firebaseConfig";
import { updateDoc, doc } from "firebase/firestore";
import { addLog } from "../utils/logger";

function Profile() {
  const { userProfile, resetPassword } = useAuth();

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [studentId, setStudentId] = useState("");
  const [subject, setSubject] = useState("");

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [successOpen, setSuccessOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const role = userProfile?.role;

  useEffect(() => {
    if (!userProfile) return;

    setName(userProfile.name || "");
    setDepartment(userProfile.department || "");
    setStudentId(userProfile.studentId || "");
    setSubject(userProfile.subject || "");
  }, [userProfile]);

  if (!userProfile) {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow border p-6 text-sm text-red-600">
          You must be logged in to view your profile.
        </div>
      </AppLayout>
    );
  }

  if (role !== "student" && role !== "teacher") {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto bg-white rounded-xl shadow border p-6 text-sm text-red-600">
          Only students and teachers can edit their profile.
        </div>
      </AppLayout>
    );
  }
  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    try {
      const ref = doc(db, "users", userProfile.uid);
      const updateData = {
        name: name.trim(),
        department: department.trim(),
      };

      if (role === "student") {
        updateData.studentId = studentId.trim();
      }

      if (role === "teacher") {
        updateData.subject = subject.trim();
      }

      await updateDoc(ref, updateData);

      await addLog({
        action:
          role === "student"
            ? "Studnet_profile_updated"
            : "teacher_profile_updated",
        message:
          role === "student"
            ? `Student ${name} updated profile`
            : `Teacher ${name} updated profile`,
        by: userProfile.uid,
      });
      setSuccessMsg("Profile updated successfully.");
      setSuccessOpen(true);
    } catch (err) {
      console.error("Failed to update profile", err);
      setErrorMsg("Failed to update profile. Please try again.");
      setErrorOpen(true);
    } finally {
      setSaving(false);
    }
  }

  async function handleResetPassword() {
    if (!userProfile.email) return;
    setResetting(true);
    setErrorMsg("");

    try {
      await resetPassword(userProfile.email);

      await addLog({
        action: "password_reset_requested",
        message: `${userProfile.name} requested a password reset link`,
        by: userProfile.uid,
      });
      setSuccessMsg(
        `Password reset email has been sent to ${userProfile.email}.`
      );
      setSuccessOpen(true);
    } catch (err) {
      console.error("Failed to send password reset email", err);
      setErrorMsg("Failed to send password reset email. Please try again.");
      setErrorOpen(true);
    } finally {
      setResetting(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              My Profile
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              View and update your account details
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            Role: {role === "student" ? "Student" : "Teacher"}
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 sm:p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-800 focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
                value={userProfile.email || ""}
                disabled
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Email cannot be changed from here. Contact admin if it’s
                incorrect.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Department
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-800 focus:outline-none"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
            </div>
            {role === "student" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Student ID
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-800 focus:outline-none"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  required
                />
              </div>
            )}
            {role === "teacher" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Subject(s)
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-800 focus:outline-none"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Python, Data Structures"
                  required
                />
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={resetting}
                className="inline-flex justify-center px-4 py-1.5 text-xs sm:text-sm rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-60"
              >
                {resetting
                  ? "Sending reset link..."
                  : "Send Password Reset Link"}
              </button>

              <div className="flex gap-2 justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-1.5 text-xs sm:text-sm rounded-full bg-gray-900 text-white hover:bg-black disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Modal
        isOpen={successOpen}
        title="Success"
        primaryLabel="OK"
        onPrimaryClick={() => setSuccessOpen(false)}
        onClose={() => setSuccessOpen(false)}
      >
        <p className="text-sm text-gray-700">{successMsg}</p>
      </Modal>

      <Modal
        isOpen={errorOpen}
        title="Error"
        primaryLabel="Close"
        onPrimaryClick={() => setErrorOpen(false)}
        onClose={() => setErrorOpen(false)}
      >
        <p className="text-sm text-red-600 whitespace-pre-line">{errorMsg}</p>
      </Modal>
    </AppLayout>
  );
}

export default Profile;
