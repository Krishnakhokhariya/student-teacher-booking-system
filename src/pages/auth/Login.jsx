import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";

export default function Login() {
  const { login, userProfile, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [resetOpen, setResetOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");

    try {
      const loggedIn = await login(email, password);
      const snap = await getDoc(doc(db, "users", loggedIn.user.uid));

      if (!snap.exists()) {
        setErrorMessage("User Profile not found.");
        setErrorOpen(true);
      }

      const profile = snap.data();

      if (profile.role === "admin") {
        navigate("/admin/dashboard");
        return;
      }

      if (profile.role === "teacher") {
        navigate("/teacher/dashboard");
        return;
      }
      if (profile.role === "student") {
        if (profile.status === "pending") {
          setErrorMessage("Your account is pending admin approval.");
          setErrorOpen(true);
          return;
        }

        if (profile.status === "rejected") {
          setErrorMessage("Your registration request was rejected.");
          setErrorOpen(true);
          return;
        }

        navigate("/student/dashboard");
      }
    } catch (err) {
      setErrorMessage("Invalid email or password");
      setErrorOpen(true);
    }
  }

  async function handleResetPassword() {
    try {
      await resetPassword(email);
      setResetSuccess(true);
    } catch (err) {
      setErrorMessage("Failed to send reset link");
      setErrorOpen(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-md p-8 animate-fadeIn">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-gray-500 mb-6">Login to continue</p>

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="text-right mt-2">
              <button
                type="button"
                className="text-sm text-gray-700 hover:text-black underline"
                onClick={() => setResetOpen(true)}
              >
                Forgot password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-sm font-medium transition-all"
          >
            Login
          </button>
        </form>

        <p className="text-center text-gray-600 mt-5 text-sm">
          New Student?{" "}
          <a
            href="/register"
            className="text-gray-800 font-medium underline hover:text-black"
          >
            Register
          </a>
        </p>
      </div>

      <Modal
        isOpen={errorOpen}
        title="Login Failed"
        primaryLabel="OK"
        onClose={() => setErrorOpen(false)}
      >
        <p className="text-sm text-red-600">{errorMessage}</p>
      </Modal>

      <Modal
        isOpen={resetOpen}
        title="Reset Password"
        primaryLabel="Send Reset Link"
        onPrimaryClick={handleResetPassword}
        onClose={() => setResetOpen(false)}
      >
        <p className="text-sm text-gray-700">
          Enter your email, Password reset link will be sent on email.
        </p>
        <input
          type="email"
          className="w-full mt-3 border border-gray-300 rounded-lg px-3 py-2 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Registered Email"
        />
      </Modal>

      <Modal
        isOpen={resetSuccess}
        title="Email Sent"
        primaryLabel="OK"
        onClose={() => setResetSuccess(false)}
      >
        <p className="text-sm text-gray-600">
          A reset password link has been sent to {email}. Check your inbox.
        </p>
      </Modal>
    </div>
  );
}
