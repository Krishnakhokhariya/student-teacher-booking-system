# AppointMe: Student–Teacher Appointment System

A role-based web application for managing student–teacher appointments in an academic environment.  
It supports three user roles (Admin, Teacher, Student) and provides scheduling, approvals, messaging, notifications, and audit logging on top of a shared layout.

---

## Live Link
Repository Link: https://github.com/Krishnakhokhariya/student-teacher-booking-system.git

---

## 1. Features Overview

### Common (All Roles)

- Shared responsive layout:
  - Common `AppLayout` with top navbar and left sidebar.
  - Sidebar content changes based on logged-in user role.
- Authentication:
  - Firebase Authentication (email/password).
  - Password reset via email.
- Secure access:
  - Route protection by role (Admin / Teacher / Student).
  - Firestore security rules enforcing role-based access.
- Notifications:
  - Global notifications page accessible from the navbar.
  - Unread count badge for notifications.
- Messaging:
  - Simple chat (one-to-one messages) between students and teachers.
  - Unread message count badge in sidebar.

---

## 2. User Roles and Workflows

### 2.1 Admin

Admin is created manually in Firestore.  
Default development credentials (can be changed as needed):

- Email: `admin@gmail.com`
- Password: `Admin@123`

After login, the admin is redirected to the Admin Dashboard.

#### Admin Dashboard

- Live stat cards:
  - Total teachers.
  - Total approved students.
  - Total pending students.
  - Total rejected students.
- Charts:
  - Bar chart showing user overview.
  - Pie chart showing distribution of user roles.
- Recent logs:
  - Latest 5 log entries from the `logs` collection.

#### Admin Sidebar

- Dashboard
- Manage Teachers
- Manage Students
- View Logs

#### Manage Teachers

- Admin-only operation: teachers cannot self-register.
- Features:
  - Add new teacher:
    - Creates Firebase user with a temporary password.
    - Saves teacher profile in `users` collection with role `teacher`.
    - Immediately sends a password reset email so teacher can set their own password.
  - Edit teacher:
    - Update fields such as name, department, subject.
    - Email is not edited here.
  - Delete teacher:
    - Removes teacher entry from `users` collection.
  - All actions are logged into `logs`.

#### Manage Students

- Two tabs: `Pending` and `Rejected`.

Pending tab:

- Shows students whose `status === "pending"`.
- Columns include basic student info.
- Actions:
  - Approve:
    - Sets `status` to `approved`.
    - Sends email to student about approval.
    - Logs the action.
  - Reject:
    - Sets `status` to `rejected`.
    - Sends email to student about rejection.
    - Logs the action.

Rejected tab:

- Lists students with `status === "rejected"`.
- Action:
  - Approve Again:
    - Allows admin to re-approve previously rejected students.
    - Sends email and logs the action.

#### View Logs

- Table listing all log entries from the `logs` collection.
- Visible only to admin.
- Logs include actions like:
  - Student registration approved/rejected.
  - Teacher added/updated/deleted.
  - Appointments approved/rejected/cancelled.
  - Profile updates, etc.

#### Admin Notifications

- Admin receives notifications when:
  - A new student registers (status pending).
- Notifications appear in the navbar with an unread count badge.
- Admin can mark notifications as read; count updates accordingly.

---

### 2.2 Teacher

Teacher accounts are created only by admin in “Manage Teacher”.  
Teachers receive a password reset email, set their password, and then login.

After login, the teacher is redirected to the Teacher Dashboard.

#### Teacher Sidebar

- Dashboard
- My Schedule
- Appointments (with live pending count badge)
- Chats (with unread message count badge)
- My Profile

#### Teacher Dashboard

- Live stat cards (for that teacher):
  - Today’s appointments count.
  - Pending appointment requests count.
  - Approved appointment requests count.
- Today’s appointments section:
  - Shows appointments scheduled for today:
    - Student name
    - Time slot
    - Purpose
    - Status (pending/approved/rejected)
- Mini calendar (one month view):
  - Highlights dates:
    - Blue: today.
    - Green: dates with approved appointments.
    - Orange: dates with pending appointments.
    - Yellow: dates where teacher has availability but no appointments.
  - On hover:
    - Shows appointments for that date with:
      - Status
      - Student name
      - Time slot.

#### My Schedule (Teacher Availability)

- Teacher can manage availability by date and time slot.
- Flow:
  - Select a date.
  - Select a time slot (from slot dropdown).
  - Add slot to availability.
- Display:
  - All availability grouped by date.
  - Slots are sorted by time.
  - Dates are sorted so upcoming days appear first.
- Auto-cleanup:
  - Availability dates before “today” are automatically deleted.
  - Students only see current and future availability.
- Actions:
  - Delete entire date with all its slots (with confirmation modal).
  - Delete an individual time slot (with confirmation modal).
- All changes are logged in `logs`.

#### Appointments

The “Appointments” page shows four tabs:

1. Pending  
2. Approved  
3. Rejected  
4. History  

Each appointment card shows:

- Student name.
- Date (formatted).
- Time slot.
- Purpose.
- Status (depending on tab).

Tabs:

- Pending:
  - List only today and future pending appointments.
  - Actions:
    - Approve (moves appointment to Approved tab).
    - Reject (moves appointment to Rejected tab).
  - Student receives notification about the status update.
- Approved:
  - List only today and future approved appointments.
  - Action:
    - Cancel appointment (handled as a rejection or cancel state; student is notified).
- Rejected:
  - List only today and future rejected appointments (if any).
  - Action:
    - Approve Again (teacher can revert the decision; student is notified).
- History:
  - Lists all past appointments (date < today) for this teacher.
  - Shows status (approved/rejected).
  - No actions, just read-only history.
- All tabs display live counts in their labels.

All approval/rejection/cancel operations:

- Update `appointments` collection.
- Add log entry to `logs`.
- Add notification to `notifications` for relevant student.

#### Chats (Teacher)

- Shows list of students that the teacher can chat with.
- Unread message count badge is displayed in the sidebar.
- On selecting a student:
  - Opens a simple chat view showing messages between that teacher and that student.
  - Teachers and students can send text messages.
- Messages are stored in `messages` collection:
  - `fromUid`, `toUid`, `message`, `createdAt`, `read`.

#### My Profile (Teacher)

- Shows teacher profile data from `users` collection.
- Teacher can:
  - Edit name, department, subject.
  - Reset password (via Firebase email reset).
- Teacher cannot change email address.
- Profile updates:
  - Saved to Firestore.
  - Logged in `logs` with messages like “Teacher [name] updated profile”.

---

### 2.3 Student

Students self-register using the registration form.

#### Registration and Approval

- Student registers with:
  - Name
  - Student ID
  - Department
  - Email
  - Password
- After registration:
  - Student document is created in `users` with:
    - `role: "student"`
    - `status: "pending"`
  - Admin is notified via `notifications`.
- Login behavior based on status:
  - `approved`: can login normally.
  - `pending`:
    - Cannot access the app.
    - Sees a modal “Registration pending, wait for admin approval.”
  - `rejected`:
    - Cannot access the app.
    - Sees a modal stating that admin rejected registration.

Once status becomes `approved`, student can login and is redirected to Student Dashboard.

#### Student Sidebar

- Dashboard
- Search Teacher
- Book Appointment
- My Appointments
- Chats
- My Profile

#### Student Dashboard

- Live stat cards:
  - Total appointments.
  - Approved appointments.
  - Pending appointments.
  - Rejected appointments.
- Today’s appointments:
  - Shows today’s appointments with:
    - Teacher name
    - Date and slot
    - Status
- Suggested teachers:
  - Suggestion based on student’s department.
  - Shows teacher name and subject.
- Mini calendar:
  - Similar to teacher calendar but from student’s perspective:
    - Blue: today.
    - Green: dates with approved appointments.
    - Orange: dates with pending appointments.
  - On hover:
    - Shows appointments with:
      - Teacher name
      - Time slot
      - Status.

#### Search Teacher

- Students can search for teachers by:
  - Name
  - Email
  - Department
  - Subject
- Each teacher card shows:
  - Name
  - Email
  - Department
  - Subject
  - Buttons:
    - View Profile
    - Book Appointment
- View Profile:
  - Opens a modal with full teacher details.
  - Shows all available dates and slots (past availability is not shown, only today and future).
- Book Appointment:
  - Navigates to the booking form with the selected teacher pre-filled.

#### Book Appointment
- cann't access directly, first need to visit search teacher and then book appointment from there only
- Shows selected teacher info (name, department, subject, email).
- Shows teacher’s available slots (only today and future; past dates are auto-cleaned on availability side).
- Student must:
  - Select date and time slot.
  - Enter purpose of appointment.
- On submit:
  - Creates an appointment in `appointments` with `status: "pending"`.
  - Shows success modal.
  - Navigates to “My Appointments”.
  - Sends notification to the respective teacher.

#### My Appointments

- Lists all appointments for the logged-in student:
  - Teacher name
  - Date and slot
  - Purpose
  - Status (pending/approved/rejected)
- Sorted by date.

#### Chats (Student)

- Shows list of teachers.
- On selecting a teacher:
  - Opens chat view between that student and that teacher.
- Unread message count badge is shown in sidebar.

#### My Profile (Student)

- Shows student profile from `users`.
- Student can:
  - Edit name, department, student ID.
  - Reset password (via Firebase email reset).
- Email cannot be changed by student.
- Profile updates:
  - Saved to Firestore.
  - Logged in `logs` with messages like “Student [name] updated profile”.

#### Student Notifications

- Student receives notifications on:
  - Appointment approved.
  - Appointment rejected.
  - Chat-related notifications.
- Notifications appear in the navbar with unread count.
- Student can mark individual notifications as read or mark all as read.

---

## 3. Tech Stack

- React (Vite dev server on `http://localhost:5173`)
- React Router
- Tailwind CSS for styling
- Heroicons for SVG icons
- Firebase:
  - Firebase Authentication
  - Cloud Firestore
- Chart library for dashboard graphs
  
---

## 4. Project Structure (Simplified)
```text
src/
 ┣ components/
 ┃ ┣ layout/
 ┃ ┃ ┣ AppNavbar.jsx
 ┃ ┃ ┗ AppSidebar.jsx
 ┃ ┣ Modal.jsx
 ┃ ┣ DeletTeacherConfirm.jsx
 ┣ context/
 ┃ ┗ AuthContext.jsx
 ┣ layouts/
 ┃ ┣ AppLayout.jsx
 ┃ ┣ AdminLayout.jsx 
 ┃ ┣ TeacherLayout.jsx
 ┃ ┗ StudentLayout.jsx
 ┣ pages/
 ┃ ┣ auth/
 ┃ ┃ ┣ Login.jsx
 ┃ ┃ ┗ Register.jsx
 ┃ ┣ admin/
 ┃ ┃ ┣ AdminDashboard.jsx
 ┃ ┃ ┣ teachers/
 ┃ ┃ ┃ ┗ ManageTeacher.jsx
 ┃ ┃ ┃ ┗ TeacherForm.jsx
 ┃ ┃ ┣ students/
 ┃ ┃ ┃ ┗ ApproveStudents.jsx
 ┃ ┃ ┗ Logs.jsx
 ┃ ┣ teacher/
 ┃ ┃ ┣ TeacherDashboard.jsx
 ┃ ┃ ┣ TeacherSchedule.jsx
 ┃ ┃ ┣ TeacherAppointments.jsx
 ┃ ┣ student/
 ┃ ┃ ┣ StudentDashboard.jsx
 ┃ ┃ ┣ TeacherSearch.jsx
 ┃ ┃ ┣ BookAppointment.jsx
 ┃ ┃ ┣ MyAppointments.jsx
 ┃ ┣ Profile.jsx
 ┃ ┣ messages.jsx
 ┃ ┗ AllNotifications.jsx
 ┣ utils/
 ┃ ┣ appointments.js
 ┃ ┣ adminStats.js
 ┃ ┣ teachers.js
 ┃ ┣ teacherAppointments.js
 ┃ ┣ availability.js
 ┃ ┣ logger.js
 ┃ ┣ notifications.js
 ┃ ┣ emailBotifications.js
 ┃ ┣ sendEmail.js
 ┃ ┣ messages.js
 ┃ ┗ students.js
 ┣ hooks/
 ┃ ┣ usePendingStudentsCount.js
 ┃ ┣ useUnreadMessageCount.js
 ┃ ┣ usePendingAppointmentsCount.js
 ┃ ┗ useUnreadNotificationsCount.js
 ┣ firebase/
 ┃ ┗ firebaseConfig.js
 ┣ routes/
 ┃ ┣ ProtectedRoutes.jsx
 ┃ ┣ AdminRoutes.jsx
 ┃ ┣ TeacherRoutes.jsx
 ┃ ┗ StudentRoutes.jsx
 ┣ App.css
 ┣ main.jsx
 ┣ index.css
 ┗ App.jsx
```

## Installation & Setup
### Clone repo
```bash
git clone https://github.com/Krishnakhokhariya/student-teacher-booking-system
```

### Move to project folder
```bash
cd student-teacher-appointment
```

### Install dependencies
```bash
npm install
```

### Firebase Setup
- create a firebase project in the Firebase console.
- Enable: Email/Password Authentications, Cloud Firestore
- In src/firebase/firebaseConfig.js, configure and initialize Firebase.

### Run development server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

---

## Future Improvements
- Improve UI
- allow to select techers from dropdown in BookAppointment.jsx, no need to visit search teacher every time

---
## Contact
#### Krishna Rajeshbhai Khokhariya  

**Email:**  
krishnakhokhariya26@gmail.com  

**LinkedIn:**  
https://www.linkedin.com/in/krishna-khokhariya-078835333/

