import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Modal from '../../components/shared/Modal';
import StatusBadge from '../../components/shared/StatusBadge';
import { getSentQueries, createQuery } from '../../services/api';
import API from '../../services/api';

const StaffQueries = () => {
  const [queries, setQueries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', toUserId: '' });
  const [adminId, setAdminId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchQueries = () =>
    getSentQueries().then(({ data }) => setQueries(data)).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => {
    fetchQueries();
    // Fetch admin user id
    API.get('/admin/users').then(({ data }) => {
      const admin = data.find(u => u.role === 'ADMIN');
      if (admin) setAdminId(admin.id);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!adminId) { setError('Admin not found'); return; }
    try {
      await createQuery({ ...form, toUserId: adminId });
      setShowModal(false);
      setForm({ title: '', message: '', toUserId: '' });
      fetchQueries();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send query');
    }
  };

  return (
    <Navbar>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.heading}>My Queries to Admin</h2>
          <button style={styles.btn} onClick={() => setShowModal(true)}>+ New Query</button>
        </div>
        {loading ? <p>Loading...</p> : (
          <>
            {queries.map(q => (
              <div key={q.id} style={{ ...styles.card, borderLeft: `4px solid ${q.status === 'PENDING' ? '#ff9800' : '#4caf50'}` }}>
                <div style={styles.cardHeader}>
                  <span style={styles.title}>{q.title}</span>
                  <StatusBadge status={q.status} />
                </div>
                <p style={styles.msg}>{q.message}</p>
                <p style={styles.meta}>To: Admin · {new Date(q.created_at).toLocaleDateString()}</p>
                {q.response && <div style={styles.response}><strong>Response:</strong> {q.response}</div>}
              </div>
            ))}
            {!queries.length && <p>No queries sent yet.</p>}
          </>
        )}
      </div>
      {showModal && (
        <Modal title="Send Query to Admin" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            {error && <div style={styles.error}>{error}</div>}
            <input style={styles.input} placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <textarea style={{ ...styles.input, height: '100px' }} placeholder="Message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
            <button style={styles.btn} type="submit">Send</button>
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
  card: { background: 'rgba(255,255,255,0.07)', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '12px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  title: { fontWeight: '600', color: '#fff' },
  msg: { margin: '0 0 8px', color: 'rgba(255,255,255,0.75)', fontSize: '14px' },
  meta: { fontSize: '12px', color: 'rgba(255,255,255,0.5)' },
  response: { marginTop: '10px', padding: '10px', background: 'rgba(46,125,50,0.25)', borderRadius: '6px', fontSize: '14px', color: '#69f0ae' },
  btn: { background: '#00bcd4', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  input: { width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
  error: { background: 'rgba(198,40,40,0.25)', color: '#ff8a80', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' },
};

export default StaffQueries;
