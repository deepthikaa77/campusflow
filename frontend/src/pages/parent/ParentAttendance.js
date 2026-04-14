import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { getAttendanceSummary } from '../../services/api';

const ParentAttendance = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAttendanceSummary(user.student_id)
      .then(({ data }) => setSummary(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const getColor = (pct) => pct >= 75 ? '#4caf50' : pct >= 60 ? '#ff9800' : '#f44336';

  return (
    <Navbar>
      <div style={styles.container}>
        <h2 style={styles.heading}>Child's Attendance</h2>
        {loading ? <p>Loading...</p> : (
          <>
            {summary.some((s) => s.percentage < 75) && (
              <div style={styles.alert}>⚠ Some subjects have attendance below 75%. Please take action.</div>
            )}
            <div style={styles.grid}>
              {summary.map((s) => (
                <div key={s.course_code} style={styles.card}>
                  <div style={styles.cardTop}>
                    <span style={styles.code}>{s.course_code}</span>
                    <span style={{ ...styles.pct, color: getColor(s.percentage) }}>{s.percentage}%</span>
                  </div>
                  <p style={styles.name}>{s.course_name}</p>
                  <div style={styles.barBg}>
                    <div style={{ ...styles.bar, width: `${s.percentage}%`, background: getColor(s.percentage) }} />
                  </div>
                  <p style={styles.sub}>{s.attended} / {s.total_classes} classes attended</p>
                  {s.percentage < 75 && <p style={styles.warn}>⚠ Below 75%</p>}
                </div>
              ))}
              {!summary.length && <p>No attendance records found.</p>}
            </div>
          </>
        )}
      </div>
    </Navbar>
  );
};

const styles = {
  container: { padding: '32px', background: 'transparent', minHeight: '100vh' },
  heading: { margin: '0 0 24px', color: '#fff' },
  alert: { background: '#fff3e0', border: '1px solid #ffb74d', color: '#ffcc80', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card: { background: 'rgba(255,255,255,0.07)', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' },
  code: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  pct: { fontSize: '22px', fontWeight: 'bold' },
  name: { margin: '0 0 12px', color: '#fff', fontSize: '15px' },
  barBg: { background: '#eee', borderRadius: '4px', height: '8px', marginBottom: '8px' },
  bar: { height: '8px', borderRadius: '4px' },
  sub: { margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.6)' },
  warn: { margin: '8px 0 0', fontSize: '12px', color: '#f44336' },
};

export default ParentAttendance;
