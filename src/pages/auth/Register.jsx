import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Modal from "../../components/Modal";
import { Navigate } from "react-router-dom";


export default function Register() {
  const { registerStudent, userProfile } = useAuth();

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // if(userProfile?.status === 'approved'){
  //   return <Navigate to="/student/dashboard" replace />
  // }

  // if(userProfile?.status === 'pending'){
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-100 px-6 py-10">
  //       <div className="bg-white shadow-lg rounded-xl p-8 border text-center max-w-md w-full animate-fadeIn">
  //         <h2 className="text-xl font-semibold text-gray-800">
  //           Your account is pending
  //         </h2>
  //         <p className="text-gray-600 mt-2 text-sm leading-relaxed">
  //           Admin has not approved your registration yet.
  //         </p>

  //         <a
  //           href="/login"
  //           className="mt-6 inline-block px-5 py-2 bg-gray-800 text-white rounded-lg text-sm hover:bg-gray-900 transition"
  //         >
  //           Go to Login
  //         </a>
  //       </div>
  //     </div>
  //   );
  // }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      await registerStudent(name, email, password, department, studentId);
      setSuccessOpen(true);

      setName("");
      setStudentId("");
      setDepartment("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setErrorMessage(err.message || "Something went wrong.");
      setErrorOpen(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 sm:px-5 py-10">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sm:p-8 w-full max-w-md animate-fadeIn">
        
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-1">
          Student Registration
        </h1>

        <p className="text-sm text-center text-gray-600 mb-6">
          Create your student account. Admin will verify and approve.
        </p>

        <form
          onSubmit={handleSubmit}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
          className="space-y-4 sm:space-y-5"
        >
         
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-500 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Student ID
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-500"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </div>

          
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-500"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            />
          </div>

        
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-gray-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          
          <button
            disabled={loading}
            type="submit"
            className="w-full py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>
        <p className="text-center text-gray-600 mt-5 text-sm">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-gray-800 font-medium underline hover:text-blue-500"
          >
            Login
          </a>
        </p>
      </div>

     
      <Modal
        isOpen={successOpen}
        title="Registration Submitted"
        primaryLabel="OK"
        onClose={() => setSuccessOpen(false)}
      >
        <p className="text-sm text-gray-700 leading-relaxed">
          Your registration has been submitted successfully.
          <br />
          Your account is now{" "}
          <span className="font-semibold">pending admin approval</span>.
        </p>
      </Modal>

     
      <Modal
        isOpen={errorOpen}
        title="Registration Failed"
        primaryLabel="Try Again"
        onClose={() => setErrorOpen(false)}
      >
        <p className="text-sm text-red-600">{errorMessage}</p>
      </Modal>
    </div>
  );
}
