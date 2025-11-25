import { Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";

function App() {
  return (
    <Routes>
      {/* auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      {/* <Route path="/admin/teacher" element={<ManageTeacher />} />
      <Route path="/admin/students" element={<ApproveStudent />} /> */}
    </Routes>
  );
}

export default App;
