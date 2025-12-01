import { useAuth } from "../../context/AuthContext";
import { usePendingStudentsCount } from "../../hooks/usePendingStudentsCount";
import useUnreadMessageCount from "../../hooks/useUnreadMessageCount";
import usePendingAppointmentsCount from "../../hooks/usePendingAppointmentsCount";

export default function AppSidebar() {
  const { userProfile } = useAuth();
  const { pendingCount } = usePendingStudentsCount();
  const { unreadCount } = useUnreadMessageCount(userProfile?.uid);
  const {pendingCount: pendingAppointment} = usePendingAppointmentsCount(
    userProfile?.uid
  );

  const role = userProfile?.role;

  const menu = {
    admin: [
      { label: "Dashboard", to: "/admin/dashboard" },
      { label: "Manage Teachers", to: "/admin/teachers" },
      { label: `Manage Students (${pendingCount})`, to: "/admin/approve-students" },
      { label: "View Logs", to: "/admin/logs" },
    ],

    teacher: [
      { label: "Dashboard", to: "/teacher/dashboard" },
      { label: "My Schedule", to: "/teacher/schedule" },
      { label: "Appointments", to: "/teacher/appointments", badge: pendingAppointment },
       { label: "Messages", to: "/teacher/messages", badge: unreadCount },
    ],

    student: [
      { label: "Dashboard", to: "/student/dashboard" },
      { label: "Search Teacher", to: "/student/search-teacher" },
      { label: "Book Appointment", to: "/student/book-appointment" },
      { label: "My Appointments", to: "/student/my-appointments" },
       { label: "Messages", to: "/student/messages", badge: unreadCount },
    ],
  };

  const links = menu[role] || [];

  return (
    <div className="h-full overflow-y-auto p-4 rounded">
      <h2 className="text-xl font-bold mb-6">{userProfile?.name}</h2>

      <nav className="space-y-3">
        {links.map((item) => (
          <a
            key={item.to}
            href={item.to}
            className="block text-gray-700 p-2 rounded hover:text-white hover:bg-gray-900"
          >
            <span>{item.label}</span>

            {item.badge > 0 && (
              <span
                className="
                  bg-red-500 text-white text-xs font-bold 
                  py-0.5 px-1.5 rounded-full
                  text-center
                  ml-2"
              >
                {item.badge}
              </span>
            )}
          </a>
        ))}
      </nav>
    </div>
  );
}
