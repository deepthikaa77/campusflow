import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getMyClass, getStudentsByClass, getAttendanceSummary } from '../../services/api';

const TutorStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [summary, setSummary] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    getMyClass().then(({ data }) => {
      if (data.classId)
        getStudentsByClass(data.classId)
          .then(({ data: st }) => setStudents(st))
          .catch(() => {})
          .finally(() => setLoading(false));
      else setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const viewAttendance = async (student) => {
    setSelected(student);
    setSummary([]);
    setSummaryError('');
    setSummaryLoading(true);
    try {
      const { data } = await getAttendanceSummary(student.registerNumber);
      setSummary(data);
    } catch {
      setSummaryError('Failed to load attendance.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const getColor = (pct) => pct >= 75 ? '#4caf50' : pct >= 60 ? '#ff9800' : '#f44336';

  const getRisk = (s) => {
    if (!s.total_possible || s.total_possible === 0) return null;
    if (s.percentage < 75) return { level: 'danger', msg: `Need ${s.needed_to_recover} more class${s.needed_to_recover === 1 ? '' : 'es'} to reach 75%` };
    if (s.safe_absents === 0) return { level: 'danger', msg: '⚠ One more absent drops below 75%!' };
    if (s.safe_absents <= 2) return { level: 'warn', msg: `⚠ Only ${s.safe_absents} absent${s.safe_absents === 1 ? '' : 's'} left` };
    return null;
  };

  return (
    <Navbar>
      <div style={s.container}>
        <h2 style={s.heading}>My Students ({students.length})</h2>

        {loading ? <p style={s.hint}>Loading...</p> : (
          <div style={s.grid}>
            {students.map((st) => (
              <div key={st.registerNumber} style={s.card}>
                <div style={s.avatar}>{st.name?.charAt(0).toUpperCase()}</div>
                <h4 style={s.name}>{st.name}</h4>
                <p style={s.reg}>{st.registerNumber}</p>
                <p style={s.sem}>Semester {st.semester}</p>
                <button style={s.btn} onClick={() => viewAttendance(st)}>View Attendance</button>
              </div>
            ))}
            {!students.length && <p style={s.hint}>No students found.</p>}
          </div>
        )}

        {/* Attendance Modal */}
        {selected && (
          <div style={s.overlay} onClick={() => setSelected(null)}>
            <div style={s.modal} onClick={e => e.stopPropagation()}>
              <div style={s.modalHeader}>
                <div>
                  <h3 style={s.modalTitle}>{selected.name}</h3>
                  <p style={s.modalSub}>{selected.registerNumber} · Semester {selected.semester}</p>
                </div>
                <button style={s.close} onClick={() => setSelected(null)}>✕</button>
              </div>

              {summaryLoading && <p style={s.hint}>Loading attendance...</p>}
              {summaryError && <p style={{ color: '#ff8a80', fontSize: '14px' }}>{summaryError}</p>}

              {!summaryLoading && !summaryError && summary.length === 0 && (
                <p style={s.hint}>No attendance records found.</p>
              )}

              {summary.map((sub) => {
                const risk = getRisk(sub);
                return (
                  <div key={sub.course_code} style={s.subRow}>
                    <div style={s.subLeft}>
                      <div style={s.subTop}>
                        <span style={s.code}>{sub.course_code}</span>
                        <span style={s.courseName}>{sub.course_name}</span>
                      </div>
                      <div style={s.barBg}>
                        <div style={{ ...s.bar, width: `${Math.min(sub.percentage, 100)}%`, background: getColor(sub.percentage) }} />
                        <div style={s.marker} />
                      </div>
                      <div style={s.subStats}>
                        <span style={s.statText}>{sub.attended} attended / {sub.total_possible ?? 0} held</span>
                        {sub.remaining_classes > 0 && (
                          <span style={s.remaining}>{sub.remaining_classes} left in sem</span>
                        )}
                      </div>
                      {risk && (
                        <span style={{ ...s.riskBadge,
                          background: risk.level === 'danger' ? 'rgba(244,67,54,0.15)' : 'rgba(255,152,0,0.15)',
                          color: risk.level === 'danger' ? '#ff8a80' : '#ffcc80',
                        }}>{risk.msg}</span>
                      )}
                    </div>
                    <span style={{ ...s.pct, color: getColor(sub.percentage) }}>{sub.percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Navbar>
  );
};

const s = {
  container: { padding: '32px', minHeight: '100vh' },
  heading: { margin: '0 0 24px', color: '#fff', fontSize: '22px', fontWeight: 700 },
  hint: { color: 'rgba(255,255,255,0.4)', fontSize: '14px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' },
  card: { background: 'rgba(255,255,255,0.07)', borderRadius: '12px', padding: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.08)' },
  avatar: { width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,#00bcd4,#006064)', color: '#fff', fontSize: '20px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' },
  name: { margin: '0 0 4px', color: '#fff', fontSize: '15px', fontWeight: 600 },
  reg: { margin: '0 0 4px', fontSize: '12px', color: 'rgba(255,255,255,0.45)' },
  sem: { margin: '0 0 14px', fontSize: '13px', color: 'rgba(255,255,255,0.55)' },
  btn: { background: 'linear-gradient(135deg,#00bcd4,#006064)', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal: { background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '16px', width: '520px', maxWidth: '95vw', maxHeight: '85vh', overflowY: 'auto', padding: '28px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  modalTitle: { margin: 0, color: '#fff', fontSize: '18px', fontWeight: 700 },
  modalSub: { margin: '4px 0 0', color: 'rgba(255,255,255,0.45)', fontSize: '13px' },
  close: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' },
  subRow: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' },
  subLeft: { flex: 1 },
  subTop: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' },
  code: { fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, background: 'rgba(255,255,255,0.07)', padding: '2px 6px', borderRadius: '4px' },
  courseName: { fontSize: '14px', color: '#fff', fontWeight: 600 },
  barBg: { position: 'relative', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', height: '6px', marginBottom: '6px' },
  bar: { height: '6px', borderRadius: '4px', transition: 'width 0.4s ease' },
  marker: { position: 'absolute', top: 0, left: '75%', width: '2px', height: '6px', background: 'rgba(255,255,255,0.35)', borderRadius: '1px' },
  subStats: { display: 'flex', gap: '12px', alignItems: 'center' },
  statText: { fontSize: '12px', color: 'rgba(255,255,255,0.5)' },
  remaining: { fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' },
  riskBadge: { display: 'inline-block', marginTop: '6px', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontWeight: 500 },
  pct: { fontSize: '22px', fontWeight: 700, minWidth: '56px', textAlign: 'right' },
};

export default TutorStudents;
