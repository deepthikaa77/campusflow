import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' }); // Change localhost to your IP if connecting remotely

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);

// Students
export const getStudents = () => API.get('/students');
export const getStudent = (id) => API.get(`/students/${id}`);
export const getStudentsByClass = (classId) => API.get(`/students/class/${classId}`);
export const createStudent = (data) => API.post('/students', data);
export const updateStudent = (id, data) => API.put(`/students/${id}`, data);
export const deleteStudent = (id) => API.delete(`/students/${id}`);

// Classrooms
export const getClassrooms = () => API.get('/classrooms');
export const getClassroom = (id) => API.get(`/classrooms/${id}`);
export const getClassroomSubjects = (id) => API.get(`/classrooms/${id}/subjects`);

// Subjects
export const getMySubjects = () => API.get('/subjects/my');

// Attendance
export const markAttendance = (data) => API.post('/attendance/mark', data);
export const getStudentAttendance = (studentId, subjectId) =>
  API.get(`/attendance/student/${studentId}`, { params: { subject_id: subjectId } });
export const getAttendanceSummary = (studentId) => API.get(`/attendance/summary/${studentId}`);
export const getAttendanceMarkSheet = (subjectId, date) =>
  API.get(`/attendance/subject/${subjectId}/marksheet`, { params: { date } });
export const getSubjectAttendance = (subjectId, date) =>
  API.get(`/attendance/subject/${subjectId}`, { params: { date } });

// Marks
export const getExamTypes = () => API.get('/marks/exam-types');
export const enterMarks = (data) => API.post('/marks', data);
export const enterBulkMarks = (data) => API.post('/marks/bulk', data);
export const getStudentMarks = (studentId) => API.get(`/marks/student/${studentId}`);
export const getSubjectMarks = (subjectId, examTypeId) =>
  API.get(`/marks/subject/${subjectId}`, { params: { exam_type_id: examTypeId } });

// Queries
export const createQuery = (data) => API.post('/queries', data);
export const getSentQueries = () => API.get('/queries/sent');
export const getReceivedQueries = () => API.get('/queries/received');
export const respondQuery = (id, data) => API.put(`/queries/${id}/respond`, data);
export const closeQuery = (id) => API.put(`/queries/${id}/close`);

// Complaints
export const createComplaint = (data) => API.post('/complaints', data);
export const getMyComplaints = () => API.get('/complaints/my');
export const getMyClassComplaints = () => API.get('/complaints/my-class');
export const respondComplaint = (id, data) => API.put(`/complaints/${id}/respond`, data);

// Grievances
export const createGrievance = (data) => API.post('/grievances', data);
export const getSentGrievances = () => API.get('/grievances/sent');
export const getReceivedGrievances = () => API.get('/grievances/received');
export const respondGrievance = (id, data) => API.put(`/grievances/${id}/respond`, data);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const getUnreadCount = () => API.get('/notifications/unread-count');
export const markAsRead = (id) => API.put(`/notifications/${id}/read`);
export const markAllAsRead = () => API.put('/notifications/read-all');

// Staff
export const getStaff = () => API.get('/staff');
export const getMyClass = () => API.get('/staff/my-class');

// AI Predictions
export const getTutorAI = () => API.get('/ai/tutor');
export const getStaffAI = () => API.get('/ai/staff');
export const getStudentAI = () => API.get('/ai/student');

// Timetable
export const getMyTimetable = () => API.get('/timetable/my');
export const getClassTimetable = (classId) => API.get(`/timetable/class/${classId}`);
export const saveTimetable = (classId, entries) => API.post(`/timetable/class/${classId}`, entries);

export default API;
