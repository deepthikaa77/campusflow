import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { getClassroomSubjects, getSubjectAttendance } from '../../services/api';

const TutorAttendance = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getClassroomSubjects(user.class_id)
      .then(({ data }) => setSubjects(data))
      .catch(() => {});
  }, [user]);

  const fetchAttendance = async () => {
    if (!selectedSubject) return;
    setLoading(true);
    getSubjectAttendance(selectedSubject, date)
      .then(({ data }) => setRecords(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedSubject) fetchAttendance();
  }, [selectedSubject, date]);

  const present = records.filter((r) => r.is_present).length;
  const total = records.length;

  return (
    <Navbar>
      <div style={styles.container}>
        <h2 style={styles.heading}>Class Attendance</h2>
        <div style={styles.filters}>
          <select style={styles.select} value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
            <option value="">Select Subject</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.course_name}</option>)}
          </select>
          <input style={styles.select} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>

        {total > 0 && (
          <div style={styles.summary}>
            <div style={styles.summaryItem}>
              <span style={styles.summaryVal}>{present}</span>
              <span style={styles.summaryLabel}>Present</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={{ ...styles.summaryVal, color: '#f44336' }}>{total - present}</span>
              <span style={styles.summaryLabel}>Absent</span>
            </div>
            <div style={styles.summaryItem}>
              <span style={{ ...styles.summaryVal, color: '#00bcd4' }}>{total}</span>
              <span style={styles.summaryLabel}>Total</span>
            </div>
          </div>
        )}

        {loading ? <p>Loading...</p> : (
          <div style={styles.list}>
            {records.map((r) => (
              <div key={r.id} style={{ ...styles.row, background: r.is_present ? '#e8f5e9' : '#fdecea' }}>
                <span style={styles.name}>{r.student_name}</span>
                <span style={styles.reg}>{r.student_id}</span>
                <span style={{ ...styles.status, color: r.is_present ? '#4caf50' : '#f44336' }}>
                  {r.is_present ? '✓ Present' : '✗ Absent'}
                </span>
              </div>
            ))}
            {!records.length && selectedSubject && <p>No attendance records for this date.</p>}
          </div>
        )}
      </div>
    </Navbar>
  );
};

const styles = {
  container: { padding: '32px', background: 'transparent', minHeight: '100vh' },
  heading: { margin: '0 0 24px', color: '#fff' },
  filters: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' },
  select: { padding: '10px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '14px', background: 'rgba(255,255,255,0.08)', color: '#fff', minWidth: '200px' },
  summary: { display: 'flex', gap: '20px', marginBottom: '24px' },
  summaryItem: { background: 'rgba(255,255,255,0.07)', borderRadius: '10px', padding: '16px 28px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
  summaryVal: { display: 'block', fontSize: '28px', fontWeight: 'bold', color: '#4caf50' },
  summaryLabel: { fontSize: '13px', color: 'rgba(255,255,255,0.5)' },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  row: { display: 'flex', alignItems: 'center', padding: '14px 20px', borderRadius: '8px', gap: '16px' },
  name: { flex: 1, fontWeight: '500', color: '#fff' },
  reg: { fontSize: '13px', color: 'rgba(255,255,255,0.5)', width: '140px' },
  status: { fontWeight: '600', fontSize: '14px', width: '100px', textAlign: 'right' },
};

export default TutorAttendance;
