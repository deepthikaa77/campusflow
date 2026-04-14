import { useState, useEffect } from 'react';
import API, { getClassrooms, getStudents } from '../../services/api';
import Navbar from '../../components/Navbar';

const defaultForm = { registerNumber: '', name: '', email: '', password: '', phoneNumber: '', semester: '', classId: '' };

const StaffStudents = () => {
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const fetchStudents = () => getStudents().then(r => setStudents(r.data)).catch(() => {});

  useEffect(() => {
    fetchStudents();
    getClassrooms().then(r => setClassrooms(r.data)).catch(() => {});
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setFormError(''); setFormSuccess('');
    try {
      await API.post('/students/register', { ...form, password: form.password || 'campus123' });
      setFormSuccess('Student registered successfully!');
      setForm(defaultForm);
      fetchStudents();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true); setError(''); setResult(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { data } = await API.post('/students/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(data);
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      setFile(null);
      e.target.reset();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Delete student ${id}?`)) return;
    await API.delete(`/students/${id}`).catch(() => {});
    fetchStudents();
  };

  const getClassName = (classId) => classrooms.find(c => c.classId === classId)?.className || classId;

  return (
    <Navbar>
      <div style={s.page}>
      <h2>Student Management</h2>

      <div style={s.card}>
        <h3>Add Student</h3>
        {formError && <div style={s.error}>{formError}</div>}
        {formSuccess && <div style={s.success}>{formSuccess}</div>}
        <form onSubmit={handleAddStudent} style={s.form}>
          <input style={s.input} placeholder="Register Number (e.g. 24MCA001)" value={form.registerNumber} onChange={e => setForm({...form, registerNumber: e.target.value})} required />
          <input style={s.input} placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <input style={s.input} placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          <input style={s.input} placeholder="Password (default: campus123)" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          <input style={s.input} placeholder="Phone Number" value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} />
          <input style={s.input} placeholder="Semester" type="number" min="1" max="8" value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} required />
          <select style={s.input} value={form.classId} onChange={e => setForm({...form, classId: e.target.value})} required>
            <option value="">Select Classroom</option>
            {classrooms.map(c => <option key={c.classId} value={c.classId}>{c.className}</option>)}
          </select>
          <button style={{...s.btn, gridColumn: '1/-1'}} type="submit">Add Student</button>
        </form>
      </div>

      <div style={s.card}>
        <h3>Import Students via Excel</h3>
        <p style={s.hint}>Excel columns (in order): <strong>register_number, name, semester, class_id, email (optional)</strong></p>
        <a href="#template" style={s.link} onClick={e => { e.preventDefault(); downloadTemplate(); }}>
          📥 Download Template
        </a>
        {error && <div style={s.error}>{error}</div>}
        {result && (
          <div style={s.resultBox}>
            <p style={{color:'#2e7d32'}}>✓ {result.message}</p>
            {result.errors?.length > 0 && (
              <ul style={s.errorList}>
                {result.errors.map((e, i) => <li key={i} style={{color:'#c62828'}}>{e}</li>)}
              </ul>
            )}
          </div>
        )}
        <form onSubmit={handleUpload} style={s.uploadForm}>
          <input type="file" accept=".xlsx,.xls" onChange={e => setFile(e.target.files[0])} required style={s.fileInput} />
          <button style={s.btn} type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Excel'}
          </button>
        </form>
      </div>

      <div style={s.card}>
        <h3>All Students ({students.length})</h3>
        {students.length === 0 ? <p>No students yet.</p> : (
          <table style={s.table}>
            <thead>
              <tr>{['Register No.','Name','Semester','Class','Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {students.map(st => (
                <tr key={st.registerNumber}>
                  <td style={s.td}>{st.registerNumber}</td>
                  <td style={s.td}>{st.name}</td>
                  <td style={s.td}>{st.semester}</td>
                  <td style={s.td}>{st.classroom?.className || getClassName(st.classroom?.classId)}</td>
                  <td style={s.td}>
                    <button style={s.deleteBtn} onClick={() => handleDelete(st.registerNumber)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
    </Navbar>
  );
};

const downloadTemplate = () => {
  const csv = 'register_number,name,semester,class_id,email\n24MCA001,John Doe,2,MCA2024,24mca001@campus.com\n24MCA002,Jane Smith,2,MCA2024,24mca002@campus.com';
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'students_template.csv'; a.click();
};

const s = {
  page: { padding: '24px', maxWidth: '1000px', margin: '0 auto' },
  card: { background: 'rgba(255,255,255,0.07)', borderRadius: '8px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  form: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  input: { padding: '10px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '14px', background: 'rgba(255,255,255,0.08)', color: '#fff' },
  success: { background: 'rgba(46,125,50,0.25)', color: '#69f0ae', padding: '10px', borderRadius: '6px', marginBottom: '12px' },
  hint: { color: 'rgba(255,255,255,0.75)', fontSize: '14px', margin: '0 0 8px' },
  link: { color: '#00bcd4', fontSize: '14px', display: 'inline-block', marginBottom: '16px' },
  uploadForm: { display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px' },
  fileInput: { flex: 1, padding: '8px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px' },
  btn: { padding: '10px 24px', background: '#00bcd4', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap' },
  error: { background: 'rgba(198,40,40,0.25)', color: '#ff8a80', padding: '10px', borderRadius: '6px', margin: '12px 0' },
  resultBox: { background: '#f1f8e9', padding: '12px', borderRadius: '6px', margin: '12px 0' },
  errorList: { margin: '8px 0 0 16px', fontSize: '13px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px', borderBottom: '2px solid rgba(255,255,255,0.15)', fontSize: '13px', color: 'rgba(255,255,255,0.6)' },
  td: { padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '14px' },
  deleteBtn: { padding: '4px 12px', background: '#e53935', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};

export default StaffStudents;
