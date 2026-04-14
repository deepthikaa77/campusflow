import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Modal from '../../components/shared/Modal';
import StatusBadge from '../../components/shared/StatusBadge';
import { getReceivedQueries, respondQuery } from '../../services/api';

const AdminQueries = () => {
  const [queries, setQueries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchQueries = () =>
    getReceivedQueries().then(({ data }) => setQueries(data)).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { fetchQueries(); }, []);

  const handleRespond = async (e) => {
    e.preventDefault();
    await respondQuery(selected.id, { response });
    setSelected(null);
    setResponse('');
    fetchQueries();
  };

  const pending = queries.filter(q => q.status === 'PENDING');
  const responded = queries.filter(q => q.status !== 'PENDING');

  return (
    <Navbar>
      <div style={styles.container}>
        <h2 style={styles.heading}>Queries from Staff & Tutors</h2>
        {loading ? <p>Loading...</p> : (
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
            {!queries.length && <p>No queries received.</p>}
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

export default AdminQueries;
