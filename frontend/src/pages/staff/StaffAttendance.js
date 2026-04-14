import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getMySubjects, getAttendanceMarkSheet, markAttendance, getMyTimetable } from '../../services/api';

const today = new Date().toISOString().split('T')[0];
const TODAY_DAY = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'][new Date().getDay()];

const HOURS = [
  { label: '1st Hour', start: '09:00', end: '10:00', hour: 1 },
  { label: '2nd Hour', start: '10:00', end: '11:00', hour: 2 },
  { label: '3rd Hour', start: '11:10', end: '12:10', hour: 3 },
  { label: '4th Hour', start: '12:10', end: '13:00', hour: 4 },
  { label: '5th Hour', start: '14:00', end: '15:00', hour: 5 },
  { label: '6th Hour', start: '15:00', end: '16:00', hour: 6 },
];

const toMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const getCurrentHour = () => {
  const now = new Date(); const mins = now.getHours() * 60 + now.getMinutes();
  return HOURS.find(h => toMins(h.start) <= mins && mins < toMins(h.end))?.hour ?? '';
};

const StaffAttendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedHour, setSelectedHour] = useState(getCurrentHour);
  const [timetable, setTimetable] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getMySubjects().then(({ data }) => setSubjects(data)).catch(() => {});
    getMyTimetable().then(({ data }) => setTimetable(data)).catch(() => {});
  }, []);

  // Hours valid for selected subject on today's day
  const validHours = selectedSubject
    ? HOURS.filter(h => timetable.some(t =>
        String(t.subjectId) === String(selectedSubject) &&
        t.dayOfWeek === TODAY_DAY &&
        t.startTime?.substring(0, 5) === h.start
      ))
    : [];

  // Auto-select if only one valid hour
  useEffect(() => {
    if (validHours.length === 1) setSelectedHour(validHours[0].hour);
    else setSelectedHour(getCurrentHour());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject]);

  useEffect(() => {
    if (!selectedSubject) return;
    setLoading(true); setStudents([]); setError('');
    getAttendanceMarkSheet(selectedSubject, today)
      .then(({ data }) => setStudents(data.map(s => ({ ...s, isPresent: s.isPresent ?? true }))))
      .catch(() => setError('Failed to load students'))
      .finally(() => setLoading(false));
  }, [selectedSubject]);

  const toggle = (studentId) =>
    setStudents(prev => prev.map(s => s.studentId === studentId ? { ...s, isPresent: !s.isPresent } : s));

  const markAll = (val) => setStudents(prev => prev.map(s => ({ ...s, isPresent: val })));

  const handleSubmit = async () => {
    setSaving(true); setError(''); setSaved(false);
    if (validHours.length === 0) { setError('No classes scheduled for this subject today'); setSaving(false); return; }
    try {
      await markAttendance({
        subjectId: Number(selectedSubject),
        date: today,
        classHour: Number(selectedHour),
        records: students.map(s => ({ studentId: s.studentId, isPresent: s.isPresent })),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const present = students.filter(s => s.isPresent).length;

  return (
    <Navbar>
      <div style={s.container}>
        <div style={s.header}>
          <div>
            <h2 style={s.heading}>Mark Attendance</h2>
            <p style={s.sub}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          {students.length > 0 && (
            <button style={{...s.saveBtn, ...(validHours.length === 0 ? s.saveBtnDisabled : {})}} onClick={handleSubmit} disabled={saving || validHours.length === 0}>
              {saving ? 'Saving...' : 'Save Attendance'}
            </button>
          )}
        </div>

        {error && <div style={s.error}>{error}</div>}
        {saved && <div style={s.success}>✓ Attendance saved successfully!</div>}

        <div style={s.selectors}>
          <select style={s.select} value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
            <option value="">Select Subject</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.course?.courseName} — {sub.classroom?.className}</option>
            ))}
          </select>
          <div style={s.hourWrap}>
            {!selectedSubject && <p style={s.hint}>Select a subject to see available hours</p>}
            {selectedSubject && validHours.length === 0 && <p style={s.hint}>No classes scheduled for this subject today</p>}
            {validHours.map(h => {
              const nowHour = getCurrentHour();
              const isCurrent = nowHour === h.hour;
              const isSelected = selectedHour === h.hour;
              return (
                <button key={h.hour} onClick={() => setSelectedHour(h.hour)}
                  style={{ ...s.hourBtn,
                    background: isSelected ? 'rgba(0,188,212,0.25)' : isCurrent ? 'rgba(255,214,0,0.1)' : 'rgba(255,255,255,0.05)',
                    border: isSelected ? '1px solid #00bcd4' : isCurrent ? '1px solid rgba(255,214,0,0.5)' : '1px solid rgba(255,255,255,0.1)',
                    color: isSelected ? '#00bcd4' : isCurrent ? '#ffd600' : 'rgba(255,255,255,0.5)',
                  }}>
                  <span style={s.hourLabel}>{h.label}</span>
                  <span style={s.hourTime}>{h.start}–{h.end}</span>
                  {isCurrent && <span style={s.liveTag}>● now</span>}
                </button>
              );
            })}
          </div>
        </div>

        {loading && <p style={s.hint}>Loading students...</p>}

        {students.length > 0 && (
          <>
            <div style={s.summary}>
              <div style={s.chip}>Total: <strong>{students.length}</strong></div>
              <div style={{ ...s.chip, color: '#69f0ae' }}>Present: <strong>{present}</strong></div>
              <div style={{ ...s.chip, color: '#ff8a80' }}>Absent: <strong>{students.length - present}</strong></div>
              <button style={s.allBtn} onClick={() => markAll(true)}>All Present</button>
              <button style={{ ...s.allBtn, background: 'rgba(244,67,54,0.15)', color: '#ff8a80' }} onClick={() => markAll(false)}>All Absent</button>
            </div>

            <div style={s.list}>
              {students.map((st, i) => (
                <div key={st.studentId} style={{ ...s.row, background: st.isPresent ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.08)', border: `1px solid ${st.isPresent ? 'rgba(76,175,80,0.3)' : 'rgba(244,67,54,0.25)'}` }}>
                  <span style={s.idx}>{i + 1}</span>
                  <div style={s.info}>
                    <span style={s.name}>{st.name}</span>
                    <span style={s.reg}>{st.registerNumber}</span>
                  </div>
                  <button style={{ ...s.toggle, background: st.isPresent ? 'rgba(76,175,80,0.25)' : 'rgba(244,67,54,0.2)', color: st.isPresent ? '#69f0ae' : '#ff8a80', border: `1px solid ${st.isPresent ? '#4caf50' : '#f44336'}` }}
                    onClick={() => toggle(st.studentId)}>
                    {st.isPresent ? '✓ Present' : '✗ Absent'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && selectedSubject && students.length === 0 && (
          <p style={s.hint}>No students found for this subject.</p>
        )}
      </div>
    </Navbar>
  );
};

const s = {
  container: { padding: '32px', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  heading: { color: '#fff', margin: 0, fontSize: '22px', fontWeight: 700 },
  sub: { color: 'rgba(255,255,255,0.45)', margin: '4px 0 0', fontSize: '13px' },
  saveBtn: { padding: '10px 28px', background: 'linear-gradient(135deg, #00bcd4, #006064)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '14px' },
  saveBtnDisabled: { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.3)', cursor: 'not-allowed' },
  error: { background: 'rgba(198,40,40,0.2)', color: '#ff8a80', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  success: { background: 'rgba(46,125,50,0.2)', color: '#69f0ae', padding: '10px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' },
  select: { padding: '10px 14px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '14px', background: 'rgba(255,255,255,0.08)', color: '#fff', minWidth: '280px', marginBottom: '16px' },
  selectors: { marginBottom: '24px' },
  hourWrap: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' },
  hourBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 14px', borderRadius: '10px', cursor: 'pointer', minWidth: '90px', transition: 'all 0.2s' },
  hourLabel: { fontWeight: 700, fontSize: '13px' },
  hourTime: { fontSize: '10px', marginTop: '2px', opacity: 0.8 },
  liveTag: { fontSize: '9px', marginTop: '3px', color: '#ffd600', fontWeight: 700, letterSpacing: '0.5px' },
  summary: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' },
  chip: { background: 'rgba(255,255,255,0.07)', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', color: 'rgba(255,255,255,0.7)' },
  allBtn: { padding: '7px 16px', background: 'rgba(76,175,80,0.15)', color: '#69f0ae', border: '1px solid rgba(76,175,80,0.3)', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 600 },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  row: { display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: '10px', gap: '14px' },
  idx: { color: 'rgba(255,255,255,0.3)', fontSize: '12px', width: '20px', textAlign: 'right' },
  info: { flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' },
  name: { color: '#fff', fontWeight: 600, fontSize: '14px' },
  reg: { color: 'rgba(255,255,255,0.4)', fontSize: '12px' },
  toggle: { padding: '7px 18px', borderRadius: '20px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', transition: 'all 0.2s' },
  hint: { color: 'rgba(255,255,255,0.4)', fontSize: '14px' },
};

export default StaffAttendance;
