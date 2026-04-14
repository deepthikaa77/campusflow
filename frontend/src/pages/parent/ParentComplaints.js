import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Modal from '../../components/shared/Modal';
import StatusBadge from '../../components/shared/StatusBadge';
import { getMyComplaints, createComplaint } from '../../services/api';

const ParentComplaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', about_student_id: '', class_id: '' });
  const [loading, setLoading] = useState(true);

  const fetchComplaints = () =>
    getMyComplaints()
      .then(({ data }) => setComplaints(data))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { fetchComplaints(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createComplaint({ ...form, about_student_id: user.student_id, class_id: user.class_id });
    setShowModal(false);
    setForm({ title: '', description: '', about_student_id: '', class_id: '' });
    fetchComplaints();
  };

  return (
    <Navbar>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.heading}>My Complaints</h2>
          <button style={styles.btn} onClick={() => setShowModal(true)}>+ File Complaint</button>
        </div>
        {loading ? <p>Loading...</p> : (
          <>
            {complaints.map((c) => (
              <div key={c.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.title}>{c.title}</span>
                  <StatusBadge status={c.status} />
                </div>
                <p style={styles.msg}>{c.description}</p>
                <p style={styles.meta}>
                  {c.student_name ? `About: ${c.student_name} · ` : ''}{new Date(c.created_at).toLocaleDateString()}
                </p>
                {c.response && <div style={styles.response}><strong>Response:</strong> {c.response}</div>}
              </div>
            ))}
            {!complaints.length && <p>No complaints filed yet.</p>}
          </>
        )}
      </div>
      {showModal && (
        <Modal title="File Complaint" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <input style={styles.input} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea style={{ ...styles.input, height: '100px' }} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <button style={styles.btn} type="submit">Submit Complaint</button>
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
  card: { background: 'rgba(255,255,255,0.07)', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '12px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  title: { fontWeight: '600', color: '#fff' },
  msg: { margin: '0 0 8px', color: 'rgba(255,255,255,0.75)', fontSize: '14px' },
  meta: { margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.5)' },
  response: { marginTop: '10px', padding: '10px', background: 'rgba(46,125,50,0.25)', borderRadius: '6px', fontSize: '14px', color: '#69f0ae' },
  input: { width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
};

export default ParentComplaints;
