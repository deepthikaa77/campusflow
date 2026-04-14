import { useState, useEffect } from 'react';
import { getClassrooms, getStaff } from '../../services/api';
import API from '../../services/api';
import Navbar from '../../components/Navbar';

const defaultForm = { classId: '', className: '', tutorId: '', semester: '', batch: '', department: '', academicYear: '' };

const StaffClassrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchClassrooms = () => getClassrooms().then(r => setClassrooms(r.data)).catch(() => {});

  useEffect(() => {
    fetchClassrooms();
    getStaff().then(r => setStaffList(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const payload = {
        classId: form.classId,
        className: form.className,
        tutorId: form.tutorId,
        semester: parseInt(form.semester),
        batch: form.batch,
        department: form.department,
        academicYear: form.academicYear,
      };
      if (editId) {
        await API.put(`/classrooms/${editId}`, payload);
        setSuccess('Classroom updated successfully!');
        setEditId(null);
      } else {
        await API.post('/classrooms', payload);
        setSuccess('Classroom created successfully!');
      }
      setForm(defaultForm);
      fetchClassrooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (c) => {
    setEditId(c.classId);
    setForm({ classId: c.classId, className: c.className, tutorId: c.tutor?.staffId || '', semester: c.semester, batch: c.batch, department: c.department, academicYear: c.academicYear });
    setError(''); setSuccess('');
  };

  const handleDelete = async (classId) => {
    if (!window.confirm(`Delete classroom ${classId}?`)) return;
    try {
      await API.delete(`/classrooms/${classId}`);
      fetchClassrooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Navbar>
      <div style={s.page}>
      <h2>Classrooms</h2>

      <div style={s.card}>
        <h3>{editId ? 'Edit Classroom' : 'Create Classroom'}</h3>
        {success && <div style={s.success}>{success}</div>}
        <form onSubmit={handleSubmit} style={s.form}>
          <input style={s.input} placeholder="Class ID (e.g. MCA2024)" value={form.classId} onChange={e => setForm({...form, classId: e.target.value})} required disabled={!!editId} />
          <input style={s.input} placeholder="Class Name (e.g. MCA 2024-2026)" value={form.className} onChange={e => setForm({...form, className: e.target.value})} required />
          <select style={s.input} value={form.tutorId} onChange={e => setForm({...form, tutorId: e.target.value})} required>
            <option value="">Select Tutor</option>
            {staffList.filter(s => s.currentRole === 'TUTOR').map(s => (
              <option key={s.staffId} value={s.staffId}>{s.name} ({s.staffId})</option>
            ))}
          </select>
          <input style={s.input} placeholder="Semester (1-8)" type="number" min="1" max="8" value={form.semester} onChange={e => setForm({...form, semester: e.target.value})} required />
          <input style={s.input} placeholder="Batch (e.g. 2024-2026)" value={form.batch} onChange={e => setForm({...form, batch: e.target.value})} required />
          <input style={s.input} placeholder="Department (e.g. MCA)" value={form.department} onChange={e => setForm({...form, department: e.target.value})} required />
          <input style={s.input} placeholder="Academic Year (e.g. 2024-2025)" value={form.academicYear} onChange={e => setForm({...form, academicYear: e.target.value})} required />
          <button style={s.btn} type="submit">{editId ? 'Update Classroom' : 'Create Classroom'}</button>
          {editId && <button style={{...s.btn, background: '#eee', color: '#fff'}} type="button" onClick={() => { setEditId(null); setForm(defaultForm); }}>Cancel</button>}
        </form>
      </div>

      <div style={s.card}>
        <h3>All Classrooms</h3>
        {error && <div style={s.error}>{error}</div>}
        {classrooms.length === 0 ? <p>No classrooms yet.</p> : (
          <table style={s.table}>
            <thead><tr>{['ID','Name','Tutor','Semester','Batch','Department','Year','Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {classrooms.map(c => (
                <tr key={c.classId}>
                  <td style={s.td}>{c.classId}</td>
                  <td style={s.td}>{c.className}</td>
                  <td style={s.td}>{c.tutor?.name}</td>
                  <td style={s.td}>{c.semester}</td>
                  <td style={s.td}>{c.batch}</td>
                  <td style={s.td}>{c.department}</td>
                  <td style={s.td}>{c.academicYear}</td>
                  <td style={s.td}>
                    <button style={s.editBtn} onClick={() => handleEdit(c)}>Edit</button>
                    <button style={s.deleteBtn} onClick={() => handleDelete(c.classId)}>Delete</button>
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

const s = {
  page: { padding: '24px', maxWidth: '900px', margin: '0 auto' },
  card: { background: 'rgba(255,255,255,0.07)', borderRadius: '8px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  form: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  input: { padding: '10px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '14px', background: 'rgba(255,255,255,0.08)', color: '#fff' },
  btn: { gridColumn: '1/-1', padding: '12px', background: '#00bcd4', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' },
  error: { background: 'rgba(198,40,40,0.25)', color: '#ff8a80', padding: '10px', borderRadius: '6px', marginBottom: '12px', gridColumn: '1/-1' },
  success: { background: 'rgba(46,125,50,0.25)', color: '#69f0ae', padding: '10px', borderRadius: '6px', marginBottom: '12px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px', borderBottom: '2px solid rgba(255,255,255,0.15)', fontSize: '13px', color: 'rgba(255,255,255,0.6)' },
  td: { padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '14px' },
  editBtn: { marginRight: '8px', padding: '4px 12px', background: '#00bcd4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  deleteBtn: { padding: '4px 12px', background: '#e53935', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};

export default StaffClassrooms;
