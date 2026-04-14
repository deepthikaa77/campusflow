import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getMyTimetable } from '../services/api';

const toMins = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const getNow = () => { const n = new Date(); const d = n.getDay(); return (d === 0 || d === 6) ? null : { mins: n.getHours() * 60 + n.getMinutes(), day: ['','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'][d] }; };

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

const COLORS = ['#00bcd4','#9c27b0','#4caf50','#ff9800','#e91e63','#3f51b5','#ff5722','#009688'];
const subjectColor = (id) => COLORS[Number(id) % COLORS.length];

const Timetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState('');
  const [now, setNow] = useState(getNow);

  useEffect(() => { const id = setInterval(() => setNow(getNow()), 60000); return () => clearInterval(id); }, []);

  const isActive = (slot) => now && toMins(slot.startTime) <= now.mins && now.mins < toMins(slot.endTime);

  useEffect(() => {
    getMyTimetable()
      .then(({ data }) => {
        setTimetable(data);
        if (data.length > 0) setClassName(data[0].className);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getCell = (day, slot) =>
    timetable.find(t => t.dayOfWeek === day &&
      t.startTime?.substring(0, 5) === slot.startTime &&
      t.endTime?.substring(0, 5) === slot.endTime);

  return (
    <Navbar>
      <div style={s.page}>
        <h2 style={s.heading}>Class Timetable</h2>
        {className && <p style={s.sub}>{className}</p>}

        {loading ? (
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading...</p>
        ) : timetable.length === 0 ? (
          <div style={s.empty}>No timetable has been created yet.</div>
        ) : (
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
                        <td key={day} style={s.breakCell}>
                          {slot.label}
                        </td>
                      ) : (
                        <td key={day} style={{ ...s.cell, ...(isActive(slot) && now?.day === day ? s.activeCell : {}) }}>
                          {(() => {
                            const t = getCell(day, slot);
                            return t ? (
                              <div style={{ ...s.assigned, background: subjectColor(t.subjectId) }}>
                                <div style={s.assignedName}>{t.courseName}</div>
                                <div style={s.assignedStaff}>{t.staffName}</div>
                              </div>
                            ) : (
                              <div style={s.emptyCell}>—</div>
                            );
                          })()}
                        </td>
                      )
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Navbar>
  );
};

const s = {
  page: { padding: '24px' },
  heading: { color: '#fff', margin: '0 0 4px', fontSize: '22px', fontWeight: 700 },
  sub: { color: 'rgba(255,255,255,0.5)', margin: '0 0 24px', fontSize: '13px' },
  empty: { color: 'rgba(255,255,255,0.5)', padding: '40px', textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' },
  gridWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '700px' },
  th: { padding: '10px 12px', color: 'rgba(255,255,255,0.6)', fontSize: '12px', fontWeight: 700, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', letterSpacing: '0.5px' },
  timeCell: { padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.08)', minWidth: '110px' },
  slotLabel: { color: '#fff', fontSize: '12px', fontWeight: 600 },
  slotTime: { color: 'rgba(255,255,255,0.4)', fontSize: '11px', marginTop: '2px' },
  cell: { padding: '6px', borderBottom: '1px solid rgba(255,255,255,0.08)', minWidth: '120px' },
  breakRow: { background: 'rgba(255,255,255,0.03)' },
  activeRow: { background: 'rgba(0,188,212,0.07)', boxShadow: 'inset 3px 0 0 #00bcd4' },
  activeTimeCell: { borderLeft: '3px solid #00bcd4' },
  activeCell: { background: 'rgba(0,188,212,0.22)', borderRadius: '6px', border: '2px solid #ffd600', boxShadow: '0 0 8px rgba(255,214,0,0.35)' },
  activeTh: { color: '#00bcd4', borderBottom: '2px solid #00bcd4' },
  breakCell: { padding: '8px 12px', color: 'rgba(255,255,255,0.3)', fontSize: '12px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', fontStyle: 'italic' },
  emptyCell: { color: 'rgba(255,255,255,0.15)', fontSize: '12px', textAlign: 'center', padding: '10px' },
  assigned: { borderRadius: '6px', padding: '8px', minHeight: '50px' },
  assignedName: { color: '#fff', fontWeight: 600, fontSize: '12px' },
  assignedStaff: { color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginTop: '2px' },
};

export default Timetable;
