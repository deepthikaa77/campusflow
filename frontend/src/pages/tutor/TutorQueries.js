import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Modal from '../../components/shared/Modal';
import StatusBadge from '../../components/shared/StatusBadge';
import { getSentQueries, getReceivedQueries, createQuery, respondQuery } from '../../services/api';
import API from '../../services/api';

const TutorQueries = () => {
  const [tab, setTab] = useState('received');
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', message: '' });
  const [adminId, setAdminId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchAll = () => {
    Promise.all([
      getReceivedQueries().then(({ data }) => setReceived(data)),
      getSentQueries().then(({ data }) => setSent(data)),
    ]).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
    API.get('/admin/users').then(({ data }) => {
      const admin = data.find(u => u.role === 'ADMIN');
      if (admin) setAdminId(admin.id);
    }).catch(() => {});
  }, []);

  const handleRespond = async (e) => {
    e.preventDefault();
    await respondQuery(selected.id, { response });
    setSelected(null);
    setResponse('');
    fetchAll();
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    if (!adminId) { setError('Admin not found'); return; }
    try {
      await createQuery({ ...form, toUserId: adminId });
      setShowModal(false);
      setForm({ title: '', message: '' });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send query');
    }
  };

  const pending = received.filter(q => q.status === 'PENDING');
  const responded = received.filter(q => q.status !== 'PENDING');

  return (
    <Navbar>
      <div style={styles.container}>
        <div style={styles.tabs}>
          <button style={tab === 'received' ? styles.tabActive : styles.tab} onClick={() => setTab('received')}>
            From Students {pending.length > 0 && <span style={styles.badge}>{pending.length}</span>}
          </button>
          <button style={tab === 'sent' ? styles.tabActive : styles.tab} onClick={() => setTab('sent')}>To Admin</button>
        </div>

        {loading ? <p>Loading...</p> : tab === 'received' ? (
          <>
            {pending.length > 0 && <h3 style={styles.section}>Pending ({pending.length})</h3>}
            {pending.map(q => (
              <div key={q.id} style={{ ...styles.card, borderLeft: '4px solid #ff9800' }}>
                <div style={styles.cardHeader}>
                  <span style={styles.title}>{q.title}</span>
                  <StatusBadge status={q.status} />
                </div>
                <p style={styles.msg}>{q.message}</p>
                <div style={styles.cardFooter}>
                  <span style={styles.meta}>From: {q.from_name} · {new Date(q.created_at).toLocaleDateString()}</span>
                  <button style={styles.btn} onClick={() => { setSelected(q); setResponse(''); }}>Respond</button>
                </div>
              </div>
            ))}
            {responded.length > 0 && <h3 style={styles.section}>Responded</h3>}
            {responded.map(q => (
              <div key={q.id} style={{ ...styles.card, borderLeft: '4px solid #4caf50' }}>
                <div style={styles.cardHeader}>
                  <span style={styles.title}>{q.title}</span>
                  <StatusBadge status={q.status} />
                </div>
                <p style={styles.msg}>{q.message}</p>
                <p style={styles.meta}>From: {q.from_name} · {new Date(q.created_at).toLocaleDateString()}</p>
                {q.response && <div style={styles.response}><strong>Your response:</strong> {q.response}</div>}
              </div>
            ))}
            {!received.length && <p>No queries from students.</p>}
          </>
        ) : (
          <>
            <div style={styles.header}>
              <h3 style={{ margin: 0 }}>Queries to Admin</h3>
              <button style={styles.btn} onClick={() => setShowModal(true)}>+ New Query</button>
            </div>
            {sent.map(q => (
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
            {!sent.length && <p>No queries sent yet.</p>}
          </>
        )}
      </div>

      {selected && (
        <Modal title={`Respond: ${selected.title}`} onClose={() => setSelected(null)}>
          <p style={styles.msg}>{selected.message}</p>
          <form onSubmit={handleRespond}>
            <textarea style={styles.textarea} placeholder="Your response..." value={response} onChange={e => setResponse(e.target.value)} required />
            <button style={styles.btn} type="submit">Send Response</button>
          </form>
        </Modal>
      )}

      {showModal && (
        <Modal title="Send Query to Admin" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSend}>
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
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px' },
  tab: { padding: '10px 24px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', background: 'rgba(255,255,255,0.07)', cursor: 'pointer', fontSize: '14px' },
  tabActive: { padding: '10px 24px', border: 'none', borderRadius: '6px', background: '#00bcd4', color: '#fff', cursor: 'pointer', fontSize: '14px' },
  badge: { background: '#f44336', color: '#fff', borderRadius: '50%', padding: '1px 6px', fontSize: '11px', marginLeft: '6px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  section: { margin: '0 0 12px', color: 'rgba(255,255,255,0.75)', fontSize: '15px' },
  card: { background: 'rgba(255,255,255,0.07)', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '12px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' },
  title: { fontWeight: '600', color: '#fff' },
  msg: { margin: '0 0 8px', color: 'rgba(255,255,255,0.75)', fontSize: '14px' },
  meta: { fontSize: '12px', color: 'rgba(255,255,255,0.5)' },
  response: { marginTop: '10px', padding: '10px', background: 'rgba(46,125,50,0.25)', borderRadius: '6px', fontSize: '14px', color: '#69f0ae' },
  btn: { background: '#00bcd4', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  input: { width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '10px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '14px', background: 'rgba(255,255,255,0.08)', color: '#fff', height: '100px', marginBottom: '12px', boxSizing: 'border-box' },
  error: { background: 'rgba(198,40,40,0.25)', color: '#ff8a80', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '14px' },
};

export default TutorQueries;
