import { Routes, Route } from "react-router-dom";

// Routes
import AdminRoutes from "./routes/AdminRoutes";
import TeacherRoutes from "./routes/TeacherRoutes";
import StudentRoutes from "./routes/StudentRoutes";
import ProtectedRoutes from "./routes/ProtectedRoutes";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageTeacher from "./pages/admin/teachers/ManageTeacher";

//teacher
import TeacherDashboard from "./pages/teacher/TeacherDashboard";

//students
import StudentDashboard from "./pages/student/StudentDashboard";

function App() {
  return (
    <Routes>
      {/* auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoutes>
            <AdminRoutes>
              <AdminDashboard />
            </AdminRoutes>
          </ProtectedRoutes>
        }
      />
       <Route
        path="/admin/teachers"
        element={
          <ProtectedRoutes>
            <AdminRoutes>
              <ManageTeacher />
            </AdminRoutes>
          </ProtectedRoutes>
        }
      />


        {/* Teacher Routes */}
       <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoutes>
            <TeacherRoutes>
              <TeacherDashboard />
            </TeacherRoutes>
          </ProtectedRoutes>
        }
      />

      {/* Student Routes */}
       <Route
        path="/student/dashboard"
        element={
          <ProtectedRoutes>
            <StudentRoutes>
              <StudentDashboard />
            </StudentRoutes>
          </ProtectedRoutes>
        }
      />
    </Routes>
    
  );
}

export default App;
