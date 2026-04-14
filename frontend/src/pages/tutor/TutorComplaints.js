import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import Modal from '../../components/shared/Modal';
import StatusBadge from '../../components/shared/StatusBadge';
import { getMyClassComplaints, respondComplaint } from '../../services/api';

const TutorComplaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchComplaints = () =>
    getMyClassComplaints()
      .then(({ data }) => setComplaints(data))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { fetchComplaints(); }, [user]);

  const handleRespond = async (e) => {
    e.preventDefault();
    await respondComplaint(selected.id, { response });
    setSelected(null);
    setResponse('');
    fetchComplaints();
  };

  const pending = complaints.filter((c) => c.status === 'PENDING');
  const others = complaints.filter((c) => c.status !== 'PENDING');

  return (
    <Navbar>
      <div style={styles.container}>
        <h2 style={styles.heading}>Complaints</h2>
        {loading ? <p>Loading...</p> : (
          <>
            {pending.length > 0 && <h3 style={styles.section}>Pending ({pending.length})</h3>}
            {pending.map((c) => (
              <div key={c.id} style={{ ...styles.card, borderLeft: '4px solid #f44336' }}>
                <div style={styles.cardHeader}>
                  <span style={styles.title}>{c.title}</span>
                  <StatusBadge status={c.status} />
                </div>
                <p style={styles.msg}>{c.description}</p>
                <div style={styles.cardFooter}>
                  <span style={styles.meta}>
                    From: {c.from_name} {c.student_name ? `· About: ${c.student_name}` : ''} · {new Date(c.created_at).toLocaleDateString()}
                  </span>
                  <button style={styles.btn} onClick={() => { setSelected(c); setResponse(''); }}>Respond</button>
                </div>
              </div>
            ))}
            {others.length > 0 && <h3 style={styles.section}>Responded</h3>}
            {others.map((c) => (
              <div key={c.id} style={{ ...styles.card, borderLeft: '4px solid #4caf50' }}>
                <div style={styles.cardHeader}>
                  <span style={styles.title}>{c.title}</span>
                  <StatusBadge status={c.status} />
                </div>
                <p style={styles.msg}>{c.description}</p>
                <p style={styles.meta}>From: {c.from_name} · {new Date(c.created_at).toLocaleDateString()}</p>
                {c.response && <div style={styles.response}><strong>Your response:</strong> {c.response}</div>}
              </div>
            ))}
            {!complaints.length && <p>No complaints received.</p>}
          </>
        )}
      </div>
      {selected && (
        <Modal title={`Respond: ${selected.title}`} onClose={() => setSelected(null)}>
          <p style={styles.msg}>{selected.description}</p>
          <form onSubmit={handleRespond}>
            <textarea style={styles.textarea} placeholder="Your response..." value={response} onChange={(e) => setResponse(e.target.value)} required />
            <button style={styles.btn} type="submit">Send Response</button>
          </form>
        </Modal>
      )}
    </Navbar>
  );
};

const styles = {
  container: { padding: '32px', background: 'transparent', minHeight: '100vh' },
  heading: { margin: '0 0 24px', color: '#fff' },
  section: { margin: '24px 0 12px', color: 'rgba(255,255,255,0.75)', fontSize: '15px' },
  card: { background: 'rgba(255,255,255,0.07)', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '12px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' },
  title: { fontWeight: '600', color: '#fff' },
  msg: { margin: '0 0 8px', color: 'rgba(255,255,255,0.75)', fontSize: '14px' },
  meta: { fontSize: '12px', color: 'rgba(255,255,255,0.5)' },
  response: { marginTop: '10px', padding: '10px', background: 'rgba(46,125,50,0.25)', borderRadius: '6px', fontSize: '14px', color: '#69f0ae' },
  btn: { background: '#00bcd4', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  textarea: { width: '100%', padding: '10px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '14px', background: 'rgba(255,255,255,0.08)', color: '#fff', height: '100px', marginBottom: '12px', boxSizing: 'border-box' },
};

export default TutorComplaints;
