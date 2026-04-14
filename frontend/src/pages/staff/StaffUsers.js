import { useState, useEffect } from 'react';
import API from '../../services/api';
import Navbar from '../../components/Navbar';

const ROLES = ['STAFF', 'TUTOR', 'PARENT'];

const defaultForm = { name: '', email: '', password: '', phoneNumber: '', role: 'STAFF', staffId: '', department: '', batch: '', studentId: '', relationship: 'FATHER' };

const StaffUsers = () => {
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = () => API.get('/admin/users').then(r => setUsers(r.data.filter(u => u.role !== 'STUDENT'))).catch(() => {});

  useEffect(() => {
    fetchUsers();
    API.get('/students').then(r => setStudents(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      if (editId) {
        await API.put(`/admin/users/${editId}`, { name: form.name, phoneNumber: form.phoneNumber, role: form.role });
        setSuccess('User updated successfully!');
        setEditId(null);
      } else {
        await API.post('/auth/register', { ...form, password: form.password || 'campus123' });
        setSuccess('User created successfully!');
      }
      setForm(defaultForm);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (u) => {
    setEditId(u.id);
    setForm({ name: u.name, email: u.email, password: '', phoneNumber: u.phoneNumber || '', role: u.role });
    setError(''); setSuccess('');
  };

  const handleApprove = async (id) => {
    await API.put(`/admin/users/${id}/approve`).catch(() => {});
    fetchUsers();
  };

  const handleRevoke = async (id) => {
    await API.put(`/admin/users/${id}/revoke`).catch(() => {});
    fetchUsers();
  };

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    try {
      await API.delete(`/admin/users/${u.id}`);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <Navbar>
      <div style={s.page}>
      <h2>User Management</h2>

      <div style={s.card}>
        <h3>{editId ? 'Edit User' : 'Create User'}</h3>
        {error && <div style={s.error}>{error}</div>}
        {success && <div style={s.success}>{success}</div>}
        <form onSubmit={handleSubmit} style={s.form}>
          <input style={s.input} placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
          <input style={s.input} placeholder="Email" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required disabled={!!editId} />
          {!editId && <input style={s.input} placeholder="Initial Password (default: 'campus123')" type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} />}
          <input style={s.input} placeholder="Phone Number" value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} />
          <select style={s.input} value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          {!editId && (form.role === 'STAFF' || form.role === 'TUTOR') && <>
            <input style={s.input} placeholder="Staff ID (e.g. STAFF001)" value={form.staffId} onChange={e => setForm({...form, staffId: e.target.value})} required />
            <input style={s.input} placeholder="Department (e.g. MCA)" value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
            <input style={s.input} placeholder="Batch (e.g. 2024-2026)" value={form.batch} onChange={e => setForm({...form, batch: e.target.value})} />
          </>}
          {!editId && form.role === 'PARENT' && <>
            <select style={s.input} value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} required>
              <option value="">Select Student</option>
              {students.map(st => (
                <option key={st.registerNumber} value={st.registerNumber}>
                  {st.name} ({st.registerNumber})
                </option>
              ))}
            </select>
            <select style={s.input} value={form.relationship} onChange={e => setForm({...form, relationship: e.target.value})}>
              <option value="FATHER">Father</option>
              <option value="MOTHER">Mother</option>
              <option value="GUARDIAN">Guardian</option>
            </select>
          </>}
          <div style={s.btnRow}>
            <button style={s.btn} type="submit">{editId ? 'Update User' : 'Create User'}</button>
            {editId && <button style={s.btnCancel} type="button" onClick={() => { setEditId(null); setForm(defaultForm); }}>Cancel</button>}
          </div>
        </form>
      </div>

      <div style={s.card}>
        <h3>All Users</h3>
        {users.length === 0 ? <p>No users found.</p> : (
          <table style={s.table}>
            <thead>
              <tr>{['Name','Email','Role','Phone','Approved','Actions'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={s.td}>{u.name}</td>
                  <td style={s.td}>{u.email}</td>
                  <td style={s.td}><span style={{...s.badge, background: roleColor(u.role)}}>{u.role}</span></td>
                  <td style={s.td}>{u.phoneNumber || '-'}</td>
                  <td style={s.td}>
                    {u.isApproved
                      ? <span className="badge bg-success">Approved</span>
                      : <span className="badge bg-secondary">Pending</span>}
                  </td>
                  <td style={s.td}>
                    <button style={s.editBtn} onClick={() => handleEdit(u)}>Edit</button>
                    {u.isApproved
                      ? <button style={s.revokeBtn} onClick={() => handleRevoke(u.id)}>Revoke</button>
                      : <button style={s.approveBtn} onClick={() => handleApprove(u.id)}>Approve</button>}
                    <button style={s.deleteBtn} onClick={() => handleDelete(u)}>Delete</button>
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

const roleColor = (role) => ({ STAFF: '#00bcd4', TUTOR: '#9c27b0', STUDENT: '#4caf50', PARENT: '#ff9800' }[role] || '#666');

const s = {
  page: { padding: '24px', maxWidth: '1000px', margin: '0 auto' },
  card: { background: 'rgba(255,255,255,0.07)', borderRadius: '8px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  form: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  input: { padding: '10px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '14px', background: 'rgba(255,255,255,0.08)', color: '#fff' },
  btnRow: { gridColumn: '1/-1', display: 'flex', gap: '12px' },
  btn: { flex: 1, padding: '12px', background: '#00bcd4', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' },
  btnCancel: { padding: '12px 24px', background: '#eee', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  error: { gridColumn: '1/-1', background: 'rgba(198,40,40,0.25)', color: '#ff8a80', padding: '10px', borderRadius: '6px' },
  success: { background: 'rgba(46,125,50,0.25)', color: '#69f0ae', padding: '10px', borderRadius: '6px', marginBottom: '12px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px', borderBottom: '2px solid rgba(255,255,255,0.15)', fontSize: '13px', color: 'rgba(255,255,255,0.6)' },
  td: { padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '14px' },
  badge: { color: '#fff', padding: '2px 10px', borderRadius: '12px', fontSize: '12px' },
  editBtn: { marginRight: '8px', padding: '4px 12px', background: '#00bcd4', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  approveBtn: { padding: '4px 12px', background: '#4caf50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' },
  revokeBtn: { padding: '4px 12px', background: '#ff9800', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' },
  deleteBtn: { padding: '4px 12px', background: '#e53935', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
};

export default StaffUsers;
