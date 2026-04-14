import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import Notifications from './pages/Notifications';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminQueries from './pages/admin/AdminQueries';

import StudentDashboard from './pages/dashboards/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentMarks from './pages/student/StudentMarks';
import StudentQueries from './pages/student/StudentQueries';
import StudentGrievances from './pages/student/StudentGrievances';
import StudentComplaints from './pages/student/StudentComplaints';

import ParentDashboard from './pages/dashboards/ParentDashboard';
import ParentAttendance from './pages/parent/ParentAttendance';
import ParentMarks from './pages/parent/ParentMarks';
import ParentComplaints from './pages/parent/ParentComplaints';

import StaffDashboard from './pages/dashboards/StaffDashboard';
import StaffMarks from './pages/staff/StaffMarks';
import StaffAttendance from './pages/staff/StaffAttendance';
import StaffQueries from './pages/staff/StaffQueries';

// Admin manages these pages (reuse staff pages)
import StaffUsers from './pages/staff/StaffUsers';
import StaffClassrooms from './pages/staff/StaffClassrooms';
import StaffStudents from './pages/staff/StaffStudents';
import StaffSubjects from './pages/staff/StaffSubjects';

import TutorDashboard from './pages/dashboards/TutorDashboard';
import TutorStudents from './pages/tutor/TutorStudents';
import TutorAttendance from './pages/tutor/TutorAttendance';
import TutorMarkAttendance from './pages/tutor/TutorMarkAttendance';
import TutorMarks from './pages/tutor/TutorMarks';
import TutorComplaints from './pages/tutor/TutorComplaints';
import TutorGrievances from './pages/tutor/TutorGrievances';
import TutorQueries from './pages/tutor/TutorQueries';
import TutorTimetable from './pages/tutor/TutorTimetable';
import Timetable from './pages/Timetable';
import TutorAI from './pages/tutor/TutorAI';
import StaffAI from './pages/staff/StaffAI';
import StudentAI from './pages/student/StudentAI';

const wrap = (roles, Component) => (
  <ProtectedRoute allowedRoles={roles}><Component /></ProtectedRoute>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Shared */}
        <Route path="/notifications" element={wrap(['ADMIN','STUDENT','PARENT','STAFF','TUTOR'], Notifications)} />
        <Route path="/timetable"     element={wrap(['STUDENT','PARENT','STAFF','TUTOR'], Timetable)} />

        {/* Admin */}
        <Route path="/admin/dashboard"  element={wrap(['ADMIN'], AdminDashboard)} />
        <Route path="/admin/users"      element={wrap(['ADMIN'], StaffUsers)} />
        <Route path="/admin/classrooms" element={wrap(['ADMIN'], StaffClassrooms)} />
        <Route path="/admin/students"   element={wrap(['ADMIN'], StaffStudents)} />
        <Route path="/admin/subjects"   element={wrap(['ADMIN'], StaffSubjects)} />
        <Route path="/admin/attendance" element={wrap(['ADMIN'], StaffAttendance)} />
        <Route path="/admin/marks"      element={wrap(['ADMIN'], StaffMarks)} />
        <Route path="/admin/queries"    element={wrap(['ADMIN'], AdminQueries)} />

        {/* Student */}
        <Route path="/student/dashboard"  element={wrap(['STUDENT'], StudentDashboard)} />
        <Route path="/student/attendance" element={wrap(['STUDENT'], StudentAttendance)} />
        <Route path="/student/marks"      element={wrap(['STUDENT'], StudentMarks)} />
        <Route path="/student/queries"    element={wrap(['STUDENT'], StudentQueries)} />
        <Route path="/student/grievances" element={wrap(['STUDENT'], StudentGrievances)} />
        <Route path="/student/complaints" element={wrap(['STUDENT'], StudentComplaints)} />
        <Route path="/student/ai"         element={wrap(['STUDENT'], StudentAI)} />

        {/* Parent */}
        <Route path="/parent/dashboard"  element={wrap(['PARENT'], ParentDashboard)} />
        <Route path="/parent/attendance" element={wrap(['PARENT'], ParentAttendance)} />
        <Route path="/parent/marks"      element={wrap(['PARENT'], ParentMarks)} />
        <Route path="/parent/complaints" element={wrap(['PARENT'], ParentComplaints)} />

        {/* Staff - enter marks & attendance for assigned subjects, send queries to admin */}
        <Route path="/staff/dashboard"  element={wrap(['STAFF'], StaffDashboard)} />
        <Route path="/staff/attendance" element={wrap(['STAFF'], StaffAttendance)} />
        <Route path="/staff/marks"      element={wrap(['STAFF'], StaffMarks)} />
        <Route path="/staff/queries"    element={wrap(['STAFF'], StaffQueries)} />
        <Route path="/staff/ai"         element={wrap(['STAFF'], StaffAI)} />

        {/* Tutor */}
        <Route path="/tutor/dashboard"       element={wrap(['TUTOR'], TutorDashboard)} />
        <Route path="/tutor/students"        element={wrap(['TUTOR'], TutorStudents)} />
        <Route path="/tutor/attendance"      element={wrap(['TUTOR'], TutorAttendance)} />
        <Route path="/tutor/mark-attendance" element={wrap(['TUTOR'], TutorMarkAttendance)} />
        <Route path="/tutor/marks"           element={wrap(['TUTOR'], TutorMarks)} />
        <Route path="/tutor/timetable"        element={wrap(['TUTOR'], TutorTimetable)} />
        <Route path="/tutor/complaints"      element={wrap(['TUTOR'], TutorComplaints)} />
        <Route path="/tutor/grievances"      element={wrap(['TUTOR'], TutorGrievances)} />
        <Route path="/tutor/queries"         element={wrap(['TUTOR'], TutorQueries)} />
        <Route path="/tutor/ai"              element={wrap(['TUTOR'], TutorAI)} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
