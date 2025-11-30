import { Routes, Route, Navigate } from "react-router-dom";

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
import ApproveStudents from "./pages/admin/students/ApproveStudents";
import Logs from "./pages/admin/Logs";


//teacher
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherSchedule from "./pages/teacher/TeacherSchedule";
import TeacherAppointments from "./pages/teacher/TeacherAppointments";

//students
import StudentDashboard from "./pages/student/StudentDashboard";
import TeacherSearch from "./pages/student/TeacherSearch";
import BookAppointment from "./pages/student/BookAppointment";
import MyAppointments from "./pages/student/MyAppointments";


function App() {
  return (
    <Routes>
      {/* auth */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      {/* public */}
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
      <Route
        path="/admin/approve-students"
        element={
          <ProtectedRoutes>
            <AdminRoutes>
              <ApproveStudents />
            </AdminRoutes>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/admin/logs"
        element={
          <ProtectedRoutes>
            <AdminRoutes>
              <Logs />
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
      <Route
        path="/teacher/schedule"
        element={
          <ProtectedRoutes>
            <TeacherRoutes>
              <TeacherSchedule />
            </TeacherRoutes>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/teacher/appointments"
        element={
          <ProtectedRoutes>
            <TeacherRoutes>
              <TeacherAppointments />
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
      <Route
        path="/student/search-teacher"
        element={
          <ProtectedRoutes>
            <StudentRoutes>
              <TeacherSearch />
            </StudentRoutes>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/student/book-appointment"
        element={
          <ProtectedRoutes>
            <StudentRoutes>
              <BookAppointment />
            </StudentRoutes>
          </ProtectedRoutes>
        }
      />
      <Route
        path="/student/my-appointments"
        element={
          <ProtectedRoutes>
            <StudentRoutes>
              <MyAppointments />
            </StudentRoutes>
          </ProtectedRoutes>
        }
      />


       {/* default fallback*/}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
    
  );
}

export default App;
