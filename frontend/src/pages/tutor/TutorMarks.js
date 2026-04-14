import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { getMySubjects, getStudentsByClass, getExamTypes, enterBulkMarks } from '../../services/api';

const TutorMarks = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [marksMap, setMarksMap] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user?.class_id) return;
    getMySubjects().then(({ data }) => setSubjects(data)).catch(() => {});
    getStudentsByClass(user.class_id).then(({ data }) => {
      setStudents(data);
      const init = {};
      data.forEach(s => (init[s.registerNumber] = ''));
      setMarksMap(init);
    }).catch(() => {});
    getExamTypes().then(({ data }) => setExamTypes(data)).catch(() => {});
  }, [user]);

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

  const maxMarks = examTypes.find(e => e.id === Number(selectedExam))?.maxMarks || 100;

  return (
    <Navbar>
      <div style={s.container}>
        <h2>Enter Marks</h2>
        <div style={s.filters}>
          <select style={s.select} value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
            <option value="">Select Subject</option>
            {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.course?.courseName}</option>)}
          </select>
          <select style={s.select} value={selectedExam} onChange={e => setSelectedExam(e.target.value)} disabled={!examTypes.length}>
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
                    <input style={{
                      ...s.input,
                      borderColor: marksMap[st.registerNumber] !== '' && (parseFloat(marksMap[st.registerNumber]) < 0 || parseFloat(marksMap[st.registerNumber]) > maxMarks) ? '#e53935' : '#ddd'
                    }}
                      type="number" min="0" max={maxMarks} placeholder="0"
                      value={marksMap[st.registerNumber]}
                      onChange={e => setMarksMap({...marksMap, [st.registerNumber]: e.target.value})} />
                    {marksMap[st.registerNumber] !== '' && parseFloat(marksMap[st.registerNumber]) > maxMarks && (
                      <span style={s.limitErr}>Max {maxMarks}</span>
                    )}
                    {marksMap[st.registerNumber] !== '' && parseFloat(marksMap[st.registerNumber]) < 0 && (
                      <span style={s.limitErr}>Min 0</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button style={s.saveBtn} onClick={handleSubmit}>Save Marks</button>
            {saved && <p style={{color:'#4caf50', fontWeight:600}}>✓ Marks saved!</p>}
          </>
        )}
      </div>
    </Navbar>
  );
};

const s = {
  container: { padding: '32px', background: 'transparent', minHeight: '100vh' },
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
};

export default TutorMarks;
