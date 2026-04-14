import { useState, useEffect } from 'react';
import API, { getClassrooms, getStaff } from '../../services/api';
import Navbar from '../../components/Navbar';

const defaultCourse = { courseId: '', courseName: '', courseCode: '', batch: '', semester: '', credits: 3 };

const StaffSubjects = () => {
  const [tab, setTab] = useState('subjects');
  const [classrooms, setClassrooms] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [subjectForm, setSubjectForm] = useState({ classId: '', courseId: '', staffId: '' });
  const [courseForm, setCourseForm] = useState(defaultCourse);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchCourses = () => API.get('/subjects/courses').then(r => setCourses(r.data)).catch(() => {});
  const fetchSubjects = (classId) => API.get(`/subjects/class/${classId}`).then(r => setSubjects(r.data)).catch(() => {});

  useEffect(() => {
    getClassrooms().then(r => setClassrooms(r.data)).catch(() => {});
    getStaff().then(r => setStaffList(r.data)).catch(() => {});
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedClass) fetchSubjects(selectedClass);
  }, [selectedClass]);

  const handleAssignSubject = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await API.post('/subjects', subjectForm);
      setSuccess('Subject assigned successfully!');
      setSubjectForm({ classId: subjectForm.classId, courseId: '', staffId: '' });
      fetchSubjects(subjectForm.classId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign subject');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      await API.post('/subjects/courses', { ...courseForm, semester: parseInt(courseForm.semester), credits: parseInt(courseForm.credits) });
      setSuccess('Course created successfully!');
      setCourseForm(defaultCourse);
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    }
  };

  const deleteSubject = async (id) => {
    if (!window.confirm('Remove this subject?')) return;
    await API.delete(`/subjects/${id}`).catch(() => {});
    fetchSubjects(selectedClass);
  };

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    await API.delete(`/subjects/courses/${id}`).catch(() => {});
    fetchCourses();
  };

  return (
    <Navbar>
      <div style={s.page}>
      <h2>Subjects Management</h2>
      <div style={s.tabs}>
        <button style={{...s.tab, ...(tab==='subjects' ? s.activeTab : {})}} onClick={() => setTab('subjects')}>Assign Subjects</button>
        <button style={{...s.tab, ...(tab==='courses' ? s.activeTab : {})}} onClick={() => setTab('courses')}>Manage Courses</button>
      </div>

      {error && <div style={s.error}>{error}</div>}
      {success && <div style={s.success}>{success}</div>}

      {tab === 'subjects' && (
        <>
          <div style={s.card}>
            <h3>Assign Subject to Class</h3>
            <form onSubmit={handleAssignSubject} style={s.form}>
              <select style={s.input} value={subjectForm.classId} onChange={e => { setSubjectForm({...subjectForm, classId: e.target.value}); setSelectedClass(e.target.value); }} required>
                <option value="">Select Class</option>
                {classrooms.map(c => <option key={c.classId} value={c.classId}>{c.className}</option>)}
              </select>
              <select style={s.input} value={subjectForm.courseId} onChange={e => setSubjectForm({...subjectForm, courseId: e.target.value})} required>
                <option value="">Select Course</option>
                {courses.map(c => <option key={c.courseId} value={c.courseId}>{c.courseName} ({c.courseCode})</option>)}
              </select>
              <select style={s.input} value={subjectForm.staffId} onChange={e => setSubjectForm({...subjectForm, staffId: e.target.value})} required>
                <option value="">Select Staff/Tutor</option>
                {staffList.filter(st => st.currentRole === 'TUTOR').length > 0 && (
                  <optgroup label="Tutors">
                    {staffList.filter(st => st.currentRole === 'TUTOR').map(st => (
                      <option key={st.staffId} value={st.staffId}>{st.name} ({st.staffId})</option>
                    ))}
                  </optgroup>
                )}
                {staffList.filter(st => st.currentRole === 'STAFF').length > 0 && (
                  <optgroup label="Staff">
                    {staffList.filter(st => st.currentRole === 'STAFF').map(st => (
                      <option key={st.staffId} value={st.staffId}>{st.name} ({st.staffId})</option>
                    ))}
                  </optgroup>
                )}
              </select>
              <button style={s.btn} type="submit">Assign Subject</button>
            </form>
          </div>

          <div style={s.card}>
            <h3>Subjects by Class</h3>
            <select style={{...s.input, marginBottom: '16px'}} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              <option value="">Select Class to View</option>
              {classrooms.map(c => <option key={c.classId} value={c.classId}>{c.className}</option>)}
            </select>
            {subjects.length === 0 ? <p>No subjects assigned.</p> : (
              <table style={s.table}>
                <thead><tr>{['Course','Code','Credits','Staff','Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {subjects.map(sub => (
                    <tr key={sub.id}>
                      <td style={s.td}>{sub.course?.courseName}</td>
                      <td style={s.td}>{sub.course?.courseCode}</td>
                      <td style={s.td}>{sub.course?.credits}</td>
                      <td style={s.td}>{sub.staff?.name}</td>
                      <td style={s.td}><button style={s.deleteBtn} onClick={() => deleteSubject(sub.id)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === 'courses' && (
        <>
          <div style={s.card}>
            <h3>Create Course</h3>
            <form onSubmit={handleCreateCourse} style={s.form}>
              <input style={s.input} placeholder="Course ID (e.g. MCA101)" value={courseForm.courseId} onChange={e => setCourseForm({...courseForm, courseId: e.target.value})} required />
              <input style={s.input} placeholder="Course Name" value={courseForm.courseName} onChange={e => setCourseForm({...courseForm, courseName: e.target.value})} required />
              <input style={s.input} placeholder="Course Code (e.g. CS101)" value={courseForm.courseCode} onChange={e => setCourseForm({...courseForm, courseCode: e.target.value})} required />
              <input style={s.input} placeholder="Batch (e.g. 2024-2026)" value={courseForm.batch} onChange={e => setCourseForm({...courseForm, batch: e.target.value})} required />
              <input style={s.input} placeholder="Semester (1-8)" type="number" min="1" max="8" value={courseForm.semester} onChange={e => setCourseForm({...courseForm, semester: e.target.value})} required />
              <input style={s.input} placeholder="Credits" type="number" min="1" value={courseForm.credits} onChange={e => setCourseForm({...courseForm, credits: e.target.value})} />
              <button style={s.btn} type="submit">Create Course</button>
            </form>
          </div>

          <div style={s.card}>
            <h3>All Courses</h3>
            {courses.length === 0 ? <p>No courses yet.</p> : (
              <table style={s.table}>
                <thead><tr>{['ID','Name','Code','Batch','Semester','Credits','Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c.courseId}>
                      <td style={s.td}>{c.courseId}</td>
                      <td style={s.td}>{c.courseName}</td>
                      <td style={s.td}>{c.courseCode}</td>
                      <td style={s.td}>{c.batch}</td>
                      <td style={s.td}>{c.semester}</td>
                      <td style={s.td}>{c.credits}</td>
                      <td style={s.td}><button style={s.deleteBtn} onClick={() => deleteCourse(c.courseId)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
    </Navbar>
  );
};

const s = {
  page: { padding: '24px', maxWidth: '1000px', margin: '0 auto' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px' },
  tab: { padding: '10px 24px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', cursor: 'pointer', background: 'rgba(255,255,255,0.07)', fontSize: '14px' },
  activeTab: { background: '#00bcd4', color: '#fff', border: '1px solid #00bcd4' },
  card: { background: 'rgba(255,255,255,0.07)', borderRadius: '8px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  form: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  input: { padding: '10px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '14px', background: 'rgba(255,255,255,0.08)', color: '#fff' },
  btn: { gridColumn: '1/-1', padding: '12px', background: '#00bcd4', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' },
  error: { background: 'rgba(198,40,40,0.25)', color: '#ff8a80', padding: '10px', borderRadius: '6px', marginBottom: '16px' },
  success: { background: 'rgba(46,125,50,0.25)', color: '#69f0ae', padding: '10px', borderRadius: '6px', marginBottom: '16px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px', borderBottom: '2px solid rgba(255,255,255,0.15)', fontSize: '13px', color: 'rgba(255,255,255,0.6)' },
  td: { padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '14px' },
  deleteBtn: { padding: '4px 12px', background: '#e53935', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};

export default StaffSubjects;
