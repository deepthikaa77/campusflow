import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { getAttendanceSummary } from '../../services/api';

const StudentAttendance = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAttendanceSummary(user.register_number)
      .then(({ data }) => setSummary(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const getColor = (pct) => pct >= 75 ? '#4caf50' : pct >= 60 ? '#ff9800' : '#f44336';

  const getRisk = (s) => {
    if (s.total_possible === 0) return null;
    if (s.percentage < 75)
      return { level: 'danger', msg: `Need ${s.needed_to_recover} more consecutive class${s.needed_to_recover === 1 ? '' : 'es'} to reach 75%` };
    if (s.safe_absents === 0)
      return { level: 'danger', msg: '⚠ One more absent drops you below 75%!' };
    if (s.safe_absents <= 2)
      return { level: 'warn', msg: `⚠ Only ${s.safe_absents} more absent${s.safe_absents === 1 ? '' : 's'} allowed` };
    return { level: 'safe', msg: `✓ ${s.safe_absents} absents remaining before 75%` };
  };

  return (
    <Navbar>
      <div style={styles.container}>
        <div style={styles.headerRow}>
          <h2 style={styles.heading}>My Attendance</h2>
          {summary.length > 0 && (
            <span style={styles.semBadge}>
              Sem started 13 Apr 2026 · 90 working days
            </span>
          )}
        </div>
        {loading ? <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</p> : (
          <div style={styles.grid}>
            {summary.map((s) => {
              const risk = getRisk(s);
              return (
                <div key={s.course_code} style={{ ...styles.card, borderTop: `3px solid ${getColor(s.percentage)}` }}>
                  <div style={styles.cardTop}>
                    <span style={styles.code}>{s.course_code}</span>
                    <span style={{ ...styles.pct, color: getColor(s.percentage) }}>{s.percentage}%</span>
                  </div>
                  <p style={styles.name}>{s.course_name}</p>
                  <p style={styles.staff}>{s.staff_name}</p>

                  <div style={styles.barBg}>
                    <div style={{ ...styles.bar, width: `${Math.min(s.percentage, 100)}%`, background: getColor(s.percentage) }} />
                    {/* 75% marker */}
                    <div style={styles.marker} title="75% threshold" />
                  </div>

                  <p style={styles.sub}>
                    {s.attended} attended &nbsp;/&nbsp; {s.total_possible} held &nbsp;/&nbsp;
                    <span style={{ color: 'rgba(255,255,255,0.35)' }}>{s.semester_total} total in sem</span>
                  </p>

                  {s.remaining_classes > 0 && (
                    <p style={styles.remaining}>{s.remaining_classes} classes remaining in semester</p>
                  )}

                  {s.total_possible === 0 && (
                    <p style={styles.noRecord}>No classes held yet</p>
                  )}

                  {risk && s.total_possible > 0 && (
                    <p style={{
                      ...styles.riskMsg,
                      background: risk.level === 'danger' ? 'rgba(244,67,54,0.12)' : risk.level === 'warn' ? 'rgba(255,152,0,0.12)' : 'rgba(76,175,80,0.1)',
                      color: risk.level === 'danger' ? '#ff8a80' : risk.level === 'warn' ? '#ffcc80' : '#a5d6a7',
                      border: `1px solid ${risk.level === 'danger' ? 'rgba(244,67,54,0.3)' : risk.level === 'warn' ? 'rgba(255,152,0,0.3)' : 'rgba(76,175,80,0.2)'}`,
                    }}>{risk.msg}</p>
                  )}
                </div>
              );
            })}
            {!summary.length && <p style={{ color: 'rgba(255,255,255,0.4)' }}>No subjects found.</p>}
          </div>
        )}
      </div>
    </Navbar>
  );
};

const styles = {
  container: { padding: '32px', background: 'transparent', minHeight: '100vh' },
  headerRow: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' },
  heading: { margin: 0, color: '#fff', fontSize: '22px', fontWeight: 700 },
  semBadge: { fontSize: '12px', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', padding: '4px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card: { background: 'rgba(255,255,255,0.07)', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  code: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 },
  pct: { fontSize: '22px', fontWeight: 'bold' },
  name: { margin: '0 0 2px', color: '#fff', fontSize: '15px', fontWeight: 600 },
  staff: { margin: '0 0 12px', fontSize: '12px', color: 'rgba(255,255,255,0.4)' },
  barBg: { position: 'relative', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', height: '8px', marginBottom: '8px' },
  bar: { height: '8px', borderRadius: '4px', transition: 'width 0.5s ease' },
  marker: { position: 'absolute', top: 0, left: '75%', width: '2px', height: '8px', background: 'rgba(255,255,255,0.4)', borderRadius: '1px' },
  sub: { margin: '0 0 4px', fontSize: '12px', color: 'rgba(255,255,255,0.55)' },
  remaining: { margin: '2px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' },
  noRecord: { margin: '8px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' },
  riskMsg: { margin: '10px 0 0', fontSize: '12px', padding: '6px 10px', borderRadius: '6px', fontWeight: 500 },
};

export default StudentAttendance;
