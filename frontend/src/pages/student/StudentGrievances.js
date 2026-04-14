import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Modal from '../../components/shared/Modal';
import StatusBadge from '../../components/shared/StatusBadge';
import { getSentGrievances, createGrievance, getStaff } from '../../services/api';

const StudentGrievances = () => {
  const [grievances, setGrievances] = useState([]);
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', toUserId: '' });

  const fetchGrievances = () => getSentGrievances().then(({ data }) => setGrievances(data)).catch(() => {});

  useEffect(() => {
    fetchGrievances();
    getStaff().then(({ data }) => setStaff(data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createGrievance(form);
    setShowModal(false);
    setForm({ title: '', description: '', toUserId: '' });
    fetchGrievances();
  };

  return (
    <Navbar>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.heading}>My Grievances</h2>
          <button style={styles.btn} onClick={() => setShowModal(true)}>+ File Grievance</button>
        </div>
        {grievances.map((g) => (
          <div key={g.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.title}>{g.title}</span>
              <StatusBadge status={g.status} />
            </div>
            <p style={styles.msg}>{g.description}</p>
            <p style={styles.meta}>To: {g.to_name} · {new Date(g.created_at).toLocaleDateString()}</p>
            {g.response && <div style={styles.response}><strong>Response:</strong> {g.response}</div>}
          </div>
        ))}
        {!grievances.length && <p>No grievances filed yet.</p>}
      </div>
      {showModal && (
        <Modal title="File Grievance" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <select style={styles.input} value={form.toUserId} onChange={(e) => setForm({ ...form, toUserId: e.target.value })} required>
              <option value="">Select Staff / Tutor</option>
              {staff.map((s) => <option key={s.staffId} value={s.userId}>{s.name} ({s.currentRole})</option>)}
            </select>
            <input style={styles.input} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea style={{ ...styles.input, height: '100px' }} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <button style={styles.btn} type="submit">Submit</button>
          </form>
        </Modal>
      )}
    </Navbar>
  );
};

const styles = {
  container: { padding: '32px', background: 'transparent', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  heading: { margin: 0, color: '#fff' },
  btn: { background: '#00bcd4', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  card: { background: 'rgba(255,255,255,0.07)', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '16px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  title: { fontWeight: '600', color: '#fff' },
  msg: { margin: '0 0 8px', color: 'rgba(255,255,255,0.75)', fontSize: '14px' },
  meta: { margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.5)' },
  response: { marginTop: '12px', padding: '10px', background: 'rgba(46,125,50,0.25)', borderRadius: '6px', fontSize: '14px', color: '#69f0ae' },
  input: { width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
};

export default StudentGrievances;
