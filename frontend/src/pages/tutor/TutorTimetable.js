import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getMyClass, getMyTimetable, saveTimetable, getClassroomSubjects } from '../../services/api';

const toMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const getNow = () => { const n = new Date(); const d = n.getDay(); return (d === 0 || d === 6) ? null : { mins: n.getHours() * 60 + n.getMinutes() }; };

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const SLOTS = [
  { label: '1st Hour',      startTime: '09:00', endTime: '10:00', isBreak: false },
  { label: '2nd Hour',      startTime: '10:00', endTime: '11:00', isBreak: false },
  { label: 'Morning Break', startTime: '11:00', endTime: '11:10', isBreak: true  },
  { label: '3rd Hour',      startTime: '11:10', endTime: '12:10', isBreak: false },
  { label: '4th Hour',      startTime: '12:10', endTime: '13:00', isBreak: false },
  { label: 'Lunch Break',   startTime: '13:00', endTime: '14:00', isBreak: true  },
  { label: '5th Hour',      startTime: '14:00', endTime: '15:00', isBreak: false },
  { label: '6th Hour',      startTime: '15:00', endTime: '16:00', isBreak: false },
];

// grid[day][slotIndex] = { subjectId, courseName, staffName } | null
const emptyGrid = () => {
  const g = {};
  DAYS.forEach(d => { g[d] = {}; SLOTS.forEach((_, i) => { g[d][i] = null; }); });
  return g;
};

const TutorTimetable = () => {
  const [subjects, setSubjects] = useState([]);
  const [grid, setGrid] = useState(emptyGrid());
  const [classId, setClassId] = useState('');
  const [className, setClassName] = useState('');
  const [dragging, setDragging] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [now, setNow] = useState(getNow);

  useEffect(() => { const id = setInterval(() => setNow(getNow()), 60000); return () => clearInterval(id); }, []);

  const isActive = (slot) => now && toMins(slot.startTime) <= now.mins && now.mins < toMins(slot.endTime);

  useEffect(() => {
    getMyClass().then(({ data }) => {
      setClassId(data.classId || '');
      setClassName(data.className || '');
      if (data.classId)
        getClassroomSubjects(data.classId).then(({ data: subs }) => setSubjects(subs)).catch(() => {});
    }).catch(() => {});

    getMyTimetable().then(({ data }) => {
      if (data.length === 0) return;
      const g = emptyGrid();
      data.forEach(t => {
        // normalize time format (backend may return HH:mm:ss)
        const start = t.startTime?.substring(0, 5);
        const end = t.endTime?.substring(0, 5);
        const slotIdx = SLOTS.findIndex(s => s.startTime === start && s.endTime === end);
        if (slotIdx !== -1 && DAYS.includes(t.dayOfWeek)) {
          g[t.dayOfWeek][slotIdx] = { subjectId: t.subjectId, courseName: t.courseName, staffName: t.staffName };
        }
      });
      setGrid(g);
    }).catch(() => {});
  }, []);

  const handleDragStart = (subject) => {
    setDragging({ subjectId: subject.id, courseName: subject.course?.courseName, staffName: subject.staff?.name });
  };

  const handleDrop = (day, slotIdx) => {
    if (!dragging) return;
    setGrid(prev => ({
      ...prev,
      [day]: { ...prev[day], [slotIdx]: dragging }
    }));
    setDragging(null);
  };

  const handleClear = (day, slotIdx) => {
    setGrid(prev => ({
      ...prev,
      [day]: { ...prev[day], [slotIdx]: null }
    }));
  };

  const handleSave = async () => {
    setError('');
    const entries = [];
    DAYS.forEach(day => {
      SLOTS.forEach((slot, i) => {
        if (!slot.isBreak && grid[day][i]) {
          entries.push({
            subjectId: grid[day][i].subjectId,
            dayOfWeek: day,
            startTime: slot.startTime,
            endTime: slot.endTime,
          });
        }
      });
    });
    try {
      await saveTimetable(classId, entries);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  const COLORS = ['#00bcd4','#9c27b0','#4caf50','#ff9800','#e91e63','#3f51b5','#ff5722','#009688'];
  const subjectColor = (id) => COLORS[Number(id) % COLORS.length];

  // Compute hours per subject from grid
  const hoursSummary = () => {
    const counts = {};
    DAYS.forEach(day => {
      SLOTS.forEach((slot, i) => {
        if (!slot.isBreak && grid[day][i]) {
          const { subjectId, courseName, staffName } = grid[day][i];
          if (!counts[subjectId]) counts[subjectId] = { courseName, staffName, hours: 0 };
          counts[subjectId].hours += 1;
        }
      });
    });
    return Object.entries(counts).map(([id, v]) => ({ subjectId: id, ...v }));
  };

  return (
    <Navbar>
      <div style={s.page}>
        <div style={s.topBar}>
          <div>
            <h2 style={s.heading}>Timetable</h2>
            <p style={s.sub}>{className}</p>
          </div>
          <button style={s.saveBtn} onClick={handleSave}>Save Timetable</button>
        </div>

        {error && <div style={s.error}>{error}</div>}
        {saved && <div style={s.success}>Timetable saved successfully!</div>}

        <div style={s.layout}>
          {/* Subject palette */}
          <div style={s.palette}>
            <div style={s.paletteTitle}>Subjects</div>
            <p style={s.paletteHint}>Drag to assign</p>
            {subjects.map(sub => (
              <div
                key={sub.id}
                draggable
                onDragStart={() => handleDragStart(sub)}
                style={{ ...s.subjectChip, background: subjectColor(sub.id) }}
              >
                <div style={s.chipName}>{sub.course?.courseName}</div>
                <div style={s.chipStaff}>{sub.staff?.name}</div>
              </div>
            ))}
          </div>

          {/* Timetable grid */}
          <div style={s.gridWrap}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Time</th>
                  {DAYS.map(d => <th key={d} style={{ ...s.th, ...(now?.day === d ? s.activeTh : {}) }}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {SLOTS.map((slot, i) => (
                  <tr key={i} style={slot.isBreak ? s.breakRow : isActive(slot) ? s.activeRow : {}}>
                    <td style={{ ...s.timeCell, ...(isActive(slot) ? s.activeTimeCell : {}) }}>
                      <div style={s.slotLabel}>{slot.label}</div>
                      <div style={s.slotTime}>{slot.startTime} – {slot.endTime}</div>
                    </td>
                    {DAYS.map(day => (
                      slot.isBreak ? (
                        <td key={day} style={s.breakCell}>—</td>
                      ) : (
                        <td
                          key={day}
                          style={{ ...s.cell, ...(isActive(slot) && now?.day === day ? s.activeCell : {}) }}
                          onDragOver={e => e.preventDefault()}
                          onDrop={() => handleDrop(day, i)}
                        >
                          {grid[day][i] ? (
                            <div style={{ ...s.assigned, background: subjectColor(grid[day][i].subjectId) }}>
                              <div style={s.assignedName}>{grid[day][i].courseName}</div>
                              <div style={s.assignedStaff}>{grid[day][i].staffName}</div>
                              <button style={s.clearBtn} onClick={() => handleClear(day, i)}>✕</button>
                            </div>
                          ) : (
                            <div style={s.emptyCell}>Drop here</div>
                          )}
                        </td>
                      )
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Hours Summary */}
        <div style={s.summaryWrap}>
          <div style={s.summaryTitle}>Weekly Hours Summary</div>
          <div style={s.summaryGrid}>
            {hoursSummary().length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>No subjects assigned yet.</p>
            ) : hoursSummary().map(item => (
              <div key={item.subjectId} style={{ ...s.summaryCard, borderLeft: `4px solid ${subjectColor(item.subjectId)}` }}>
                <div style={s.summaryCount}>{item.hours}</div>
                <div style={s.summaryLabel}>{item.hours === 1 ? 'hr' : 'hrs'} / week</div>
                <div style={s.summaryName}>{item.courseName}</div>
                <div style={s.summaryStaff}>{item.staffName}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Navbar>
  );
};

const s = {
  page: { padding: '24px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  heading: { color: '#fff', margin: 0, fontSize: '22px', fontWeight: 700 },
  sub: { color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', fontSize: '13px' },
  saveBtn: { padding: '10px 28px', background: 'linear-gradient(135deg, #00bcd4, #006064)', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: '14px' },
  error: { background: 'rgba(198,40,40,0.25)', color: '#ff8a80', padding: '10px', borderRadius: '6px', marginBottom: '12px' },
  success: { background: 'rgba(46,125,50,0.25)', color: '#69f0ae', padding: '10px', borderRadius: '6px', marginBottom: '12px' },
  layout: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
  palette: { width: '160px', minWidth: '160px', background: 'rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255,255,255,0.12)' },
  paletteTitle: { color: '#fff', fontWeight: 700, fontSize: '14px', marginBottom: '4px' },
  paletteHint: { color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '12px' },
  subjectChip: { borderRadius: '8px', padding: '10px', marginBottom: '8px', cursor: 'grab', userSelect: 'none' },
  chipName: { color: '#fff', fontWeight: 600, fontSize: '13px' },
  chipStaff: { color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginTop: '2px' },
  gridWrap: { flex: 1, overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '700px' },
  th: { padding: '10px 12px', color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 700, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', letterSpacing: '0.5px' },
  timeCell: { padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)', minWidth: '110px' },
  slotLabel: { color: '#fff', fontSize: '12px', fontWeight: 600 },
  slotTime: { color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' },
  cell: { padding: '6px', borderBottom: '1px solid rgba(255,255,255,0.08)', verticalAlign: 'top', minWidth: '120px' },
  breakRow: { background: 'rgba(255,255,255,0.03)' },
  activeRow: { background: 'rgba(0,188,212,0.07)', boxShadow: 'inset 3px 0 0 #00bcd4' },
  activeTimeCell: { borderLeft: '3px solid #00bcd4' },
  activeCell: { background: 'rgba(0,188,212,0.22)', borderRadius: '6px', border: '2px solid #ffd600', boxShadow: '0 0 8px rgba(255,214,0,0.35)' },
  activeTh: { color: '#00bcd4', borderBottom: '2px solid #00bcd4' },
  breakCell: { padding: '6px 12px', color: 'rgba(255,255,255,0.25)', fontSize: '12px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' },
  emptyCell: { border: '1px dashed rgba(255,255,255,0.15)', borderRadius: '6px', padding: '10px', color: 'rgba(255,255,255,0.2)', fontSize: '11px', textAlign: 'center', minHeight: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  assigned: { borderRadius: '6px', padding: '8px', position: 'relative', minHeight: '50px' },
  assignedName: { color: '#fff', fontWeight: 600, fontSize: '12px', paddingRight: '16px' },
  assignedStaff: { color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginTop: '2px' },
  clearBtn: { position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', cursor: 'pointer', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 },
  summaryWrap: { marginTop: '28px' },
  summaryTitle: { color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '14px' },
  summaryGrid: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  summaryCard: { background: 'rgba(255,255,255,0.07)', borderRadius: '10px', padding: '14px 18px', border: '1px solid rgba(255,255,255,0.1)', minWidth: '140px' },
  summaryCount: { color: '#fff', fontSize: '28px', fontWeight: 700, lineHeight: 1 },
  summaryLabel: { color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginBottom: '8px' },
  summaryName: { color: '#fff', fontWeight: 600, fontSize: '13px' },
  summaryStaff: { color: 'rgba(255,255,255,0.5)', fontSize: '11px', marginTop: '2px' },
};

export default TutorTimetable;
