import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Modal from '../../components/shared/Modal';
import StatusBadge from '../../components/shared/StatusBadge';
import { getMyComplaints, createComplaint } from '../../services/api';

const StudentComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [error, setError] = useState('');

  const fetchComplaints = () => getMyComplaints().then(({ data }) => setComplaints(data)).catch(() => {});

  useEffect(() => { fetchComplaints(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createComplaint(form); // classId auto-detected by backend for students
      setShowModal(false);
      setForm({ title: '', description: '' });
      fetchComplaints();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    }
  };

  return (
    <Navbar>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.heading}>My Complaints</h2>
          <button style={styles.btn} onClick={() => setShowModal(true)}>+ New Complaint</button>
        </div>
        {complaints.map((c) => (
          <div key={c.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.title}>{c.title}</span>
              <StatusBadge status={c.status} />
            </div>
            <p style={styles.msg}>{c.description}</p>
            <p style={styles.meta}>Class: {c.class_name} · {new Date(c.created_at).toLocaleDateString()}</p>
            {c.response && <div style={styles.response}><strong>Response:</strong> {c.response}</div>}
          </div>
        ))}
        {!complaints.length && <p>No complaints submitted yet.</p>}
      </div>
      {showModal && (
        <Modal title="Submit Complaint" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            {error && <div style={styles.error}>{error}</div>}
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
  error: { background: 'rgba(198,40,40,0.25)', color: '#ff8a80', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' },
  input: { width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
};

export default StudentComplaints;
