import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Modal from '../../components/shared/Modal';
import StatusBadge from '../../components/shared/StatusBadge';
import { getReceivedGrievances, respondGrievance } from '../../services/api';

const TutorGrievances = () => {
  const [grievances, setGrievances] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ response: '', status: 'IN_PROGRESS' });
  const [loading, setLoading] = useState(true);

  const fetchGrievances = () =>
    getReceivedGrievances()
      .then(({ data }) => setGrievances(data))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { fetchGrievances(); }, []);

  const handleRespond = async (e) => {
    e.preventDefault();
    await respondGrievance(selected.id, form);
    setSelected(null);
    setForm({ response: '', status: 'IN_PROGRESS' });
    fetchGrievances();
  };

  const pending = grievances.filter((g) => g.status === 'PENDING');
  const others = grievances.filter((g) => g.status !== 'PENDING');

  return (
    <Navbar>
      <div style={styles.container}>
        <h2 style={styles.heading}>Grievances</h2>
        {loading ? <p>Loading...</p> : (
          <>
            {pending.length > 0 && <h3 style={styles.section}>Pending ({pending.length})</h3>}
            {pending.map((g) => (
              <div key={g.id} style={{ ...styles.card, borderLeft: '4px solid #ff9800' }}>
                <div style={styles.cardHeader}>
                  <span style={styles.title}>{g.title}</span>
                  <StatusBadge status={g.status} />
                </div>
                <p style={styles.msg}>{g.description}</p>
                <div style={styles.cardFooter}>
                  <span style={styles.meta}>From: {g.from_name} · {new Date(g.created_at).toLocaleDateString()}</span>
                  <button style={styles.btn} onClick={() => { setSelected(g); setForm({ response: '', status: 'IN_PROGRESS' }); }}>Respond</button>
                </div>
              </div>
            ))}
            {others.length > 0 && <h3 style={styles.section}>Responded</h3>}
            {others.map((g) => (
              <div key={g.id} style={{ ...styles.card, borderLeft: '4px solid #4caf50' }}>
                <div style={styles.cardHeader}>
                  <span style={styles.title}>{g.title}</span>
                  <StatusBadge status={g.status} />
                </div>
                <p style={styles.msg}>{g.description}</p>
                <p style={styles.meta}>From: {g.from_name} · {new Date(g.created_at).toLocaleDateString()}</p>
                {g.response && <div style={styles.response}><strong>Your response:</strong> {g.response}</div>}
              </div>
            ))}
            {!grievances.length && <p>No grievances received.</p>}
          </>
        )}
      </div>
      {selected && (
        <Modal title={`Respond: ${selected.title}`} onClose={() => setSelected(null)}>
          <p style={styles.msg}>{selected.description}</p>
          <form onSubmit={handleRespond}>
            <select style={styles.input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <textarea style={{ ...styles.input, height: '100px' }} placeholder="Your response..." value={form.response} onChange={(e) => setForm({ ...form, response: e.target.value })} required />
            <button style={styles.btn} type="submit">Submit Response</button>
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
  input: { width: '100%', padding: '10px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '14px', background: 'rgba(255,255,255,0.08)', color: '#fff', marginBottom: '12px', boxSizing: 'border-box' },
};

export default TutorGrievances;
