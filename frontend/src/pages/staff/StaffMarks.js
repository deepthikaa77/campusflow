import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { getMySubjects, getClassrooms, getClassroomSubjects, getStudentsByClass, getExamTypes, enterBulkMarks, getSubjectMarks } from '../../services/api';

const StaffMarks = () => {
  const [tab, setTab] = useState('enter'); // 'enter' | 'view'

  // Enter marks state
  const [mySubjects, setMySubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [marksMap, setMarksMap] = useState({});
  const [saved, setSaved] = useState(false);

  // View marks state
  const [classrooms, setClassrooms] = useState([]);
  const [viewSubjects, setViewSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [viewSubject, setViewSubject] = useState('');
  const [viewExam, setViewExam] = useState('');
  const [marks, setMarks] = useState([]);

  useEffect(() => {
    getMySubjects().then(({ data }) => setMySubjects(data)).catch(() => {});
    getExamTypes().then(({ data }) => setExamTypes(data)).catch(() => {});
    getClassrooms().then(({ data }) => setClassrooms(data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSubject) return;
    const sub = mySubjects.find(s => String(s.id) === String(selectedSubject));
    if (sub?.classroom?.classId) {
      getStudentsByClass(sub.classroom.classId).then(({ data }) => {
        setStudents(data);
        const init = {};
        data.forEach(s => (init[s.registerNumber] = ''));
        setMarksMap(init);
      }).catch(() => {});
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (!selectedClass) return;
    setViewSubjects([]); setViewSubject(''); setMarks([]);
    getClassroomSubjects(selectedClass).then(({ data }) => setViewSubjects(data)).catch(() => {});
  }, [selectedClass]);

  useEffect(() => {
    if (!viewSubject || !viewExam) return;
    getSubjectMarks(viewSubject, viewExam).then(({ data }) => setMarks(data)).catch(() => {});
  }, [viewSubject, viewExam]);

  const maxMarks = examTypes.find(e => e.id === Number(selectedExam))?.maxMarks || 100;

  const handleSubmit = async () => {
    if (!selectedSubject || !selectedExam) return alert('Select subject and exam type');
    const hasInvalid = students.some(st => {
      const v = parseFloat(marksMap[st.registerNumber]);
      return marksMap[st.registerNumber] !== '' && (v < 0 || v > maxMarks);
    });
    if (hasInvalid) return alert(`Some marks are out of range (0 - ${maxMarks})`);
    const records = students
      .filter(st => marksMap[st.registerNumber] !== '')
      .map(st => ({ studentId: st.registerNumber, marksObtained: parseFloat(marksMap[st.registerNumber]) }));
    if (!records.length) return alert('Enter marks for at least one student');
    try {
      await enterBulkMarks({ records, subjectId: parseInt(selectedSubject), examTypeId: parseInt(selectedExam) });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save marks');
    }
  };

  return (
    <Navbar>
      <div style={s.container}>
        <div style={s.tabs}>
          <button style={tab === 'enter' ? s.tabActive : s.tab} onClick={() => setTab('enter')}>Enter Marks</button>
          <button style={tab === 'view' ? s.tabActive : s.tab} onClick={() => setTab('view')}>View Marks</button>
        </div>

        {tab === 'enter' && (
          <>
            <h2>Enter Marks</h2>
            {mySubjects.length === 0 && <p style={{color:'#888'}}>No subjects assigned to you.</p>}
            <div style={s.filters}>
              <select style={s.select} value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedExam(''); }}>
                <option value="">Select Your Subject</option>
                {mySubjects.map(sub => (
                  <option key={sub.id} value={sub.id}>
                    {sub.course?.courseName} — {sub.classroom?.className}
                  </option>
                ))}
              </select>
              <select style={s.select} value={selectedExam} onChange={e => setSelectedExam(e.target.value)} disabled={!selectedSubject}>
                <option value="">Select Exam Type</option>
                {examTypes.map(e => <option key={e.id} value={e.id}>{e.name} (Max: {e.maxMarks})</option>)}
              </select>
            </div>
            {students.length > 0 && selectedSubject && selectedExam && (
              <>
                <div style={s.list}>
                  <div style={s.header}><span>Student</span><span>Register No.</span><span>Marks (/{maxMarks})</span></div>
                  {students.map(st => (
                    <div key={st.registerNumber} style={s.row}>
                      <span style={s.name}>{st.name}</span>
                      <span style={s.reg}>{st.registerNumber}</span>
                      <div style={{display:'flex', flexDirection:'column'}}>
                        <input style={{...s.input, borderColor: marksMap[st.registerNumber] !== '' && (parseFloat(marksMap[st.registerNumber]) < 0 || parseFloat(marksMap[st.registerNumber]) > maxMarks) ? '#e53935' : '#ddd'}}
                          type="number" min="0" max={maxMarks} placeholder="0"
                          value={marksMap[st.registerNumber]}
                          onChange={e => setMarksMap({...marksMap, [st.registerNumber]: e.target.value})} />
                        {marksMap[st.registerNumber] !== '' && parseFloat(marksMap[st.registerNumber]) > maxMarks && <span style={s.limitErr}>Max {maxMarks}</span>}
                        {marksMap[st.registerNumber] !== '' && parseFloat(marksMap[st.registerNumber]) < 0 && <span style={s.limitErr}>Min 0</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <button style={s.saveBtn} onClick={handleSubmit}>Save Marks</button>
                {saved && <p style={{color:'#4caf50', fontWeight:600}}>✓ Marks saved!</p>}
              </>
            )}
          </>
        )}

        {tab === 'view' && (
          <>
            <h2>View Marks</h2>
            <div style={s.filters}>
              <select style={s.select} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                <option value="">Select Class</option>
                {classrooms.map(c => <option key={c.classId} value={c.classId}>{c.className}</option>)}
              </select>
              <select style={s.select} value={viewSubject} onChange={e => setViewSubject(e.target.value)} disabled={!viewSubjects.length}>
                <option value="">Select Subject</option>
                {viewSubjects.map(s => <option key={s.id} value={s.id}>{s.course?.courseName}</option>)}
              </select>
              <select style={s.select} value={viewExam} onChange={e => setViewExam(e.target.value)} disabled={!examTypes.length}>
                <option value="">Select Exam Type</option>
                {examTypes.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            {marks.length > 0 && (
              <table style={s.table}>
                <thead><tr>{['Student','Register No.','Marks','Max Marks'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {marks.map(m => (
                    <tr key={m.id}>
                      <td style={s.td}>{m.studentName}</td>
                      <td style={s.td}>{m.studentId}</td>
                      <td style={s.td}>{m.marksObtained}</td>
                      <td style={s.td}>{m.maxMarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {viewSubject && viewExam && marks.length === 0 && <p>No marks found.</p>}
          </>
        )}
      </div>
    </Navbar>
  );
};

const s = {
  container: { padding: '32px', background: 'transparent', minHeight: '100vh' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '24px' },
  tab: { padding: '10px 24px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', background: 'rgba(255,255,255,0.07)', cursor: 'pointer', fontSize: '14px' },
  tabActive: { padding: '10px 24px', border: 'none', borderRadius: '6px', background: '#00bcd4', color: '#fff', cursor: 'pointer', fontSize: '14px' },
  filters: { display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' },
  select: { padding: '10px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '14px', background: 'rgba(255,255,255,0.08)', color: '#fff', minWidth: '200px' },
  list: { background: 'rgba(255,255,255,0.07)', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '20px' },
  header: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '12px 20px', background: 'rgba(255,255,255,0.05)', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.75)' },
  row: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)', alignItems: 'center' },
  name: { fontWeight: 500, color: '#fff' },
  reg: { fontSize: '13px', color: 'rgba(255,255,255,0.5)' },
  input: { width: '80px', padding: '6px 10px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '14px' },
  limitErr: { color: '#e53935', fontSize: '11px', marginTop: '2px' },
  saveBtn: { background: '#00bcd4', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '6px', cursor: 'pointer', fontSize: '15px' },
  table: { width: '100%', borderCollapse: 'collapse', background: 'rgba(255,255,255,0.07)', borderRadius: '8px', overflow: 'hidden' },
  th: { textAlign: 'left', padding: '12px 16px', background: 'rgba(255,255,255,0.05)', fontSize: '13px', color: 'rgba(255,255,255,0.75)' },
  td: { padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontSize: '14px' },
};

export default StaffMarks;
