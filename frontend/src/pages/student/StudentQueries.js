import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Modal from '../../components/shared/Modal';
import StatusBadge from '../../components/shared/StatusBadge';
import { getSentQueries, createQuery, getStaff } from '../../services/api';

const StudentQueries = () => {
  const [queries, setQueries] = useState([]);
  const [staff, setStaff] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', toUserId: '' });
  const [loading, setLoading] = useState(true);

  const fetchQueries = () => getSentQueries().then(({ data }) => setQueries(data)).catch(() => {});

  useEffect(() => {
    Promise.all([fetchQueries(), getStaff().then(({ data }) => setStaff(data))])
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createQuery(form);
    setShowModal(false);
    setForm({ title: '', message: '', toUserId: '' });
    fetchQueries();
  };

  return (
    <Navbar>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.heading}>My Queries</h2>
          <button style={styles.btn} onClick={() => setShowModal(true)}>+ New Query</button>
        </div>
        {loading ? <p>Loading...</p> : (
          <div>
            {queries.map((q) => (
              <div key={q.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.title}>{q.title}</span>
                  <StatusBadge status={q.status} />
                </div>
                <p style={styles.msg}>{q.message}</p>
                <p style={styles.meta}>To: {q.to_name} · {new Date(q.created_at).toLocaleDateString()}</p>
                {q.response && (
                  <div style={styles.response}>
                    <strong>Response:</strong> {q.response}
                  </div>
                )}
              </div>
            ))}
            {!queries.length && <p>No queries sent yet.</p>}
          </div>
        )}
      </div>
      {showModal && (
        <Modal title="Send Query" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <select className="dark-input" style={styles.input} value={form.toUserId} onChange={(e) => setForm({ ...form, toUserId: e.target.value })} required>
              <option value="">Select Staff</option>
              {staff.map((s) => <option key={s.staffId} value={s.userId}>{s.name}</option>)}
            </select>
            <input className="dark-input" style={styles.input} placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <textarea className="dark-input" style={{ ...styles.input, height: '100px' }} placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            <button style={styles.btn} type="submit">Send Query</button>
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
  input: { width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', background: 'rgba(255,255,255,0.08)', color: '#fff', outline: 'none' },
};

export default StudentQueries;
