import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { getStudentMarks } from '../../services/api';

const ParentMarks = () => {
  const { user } = useAuth();
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentMarks(user.student_id)
      .then(({ data }) => setMarks(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const grouped = marks.reduce((acc, m) => {
    if (!acc[m.course_name]) acc[m.course_name] = [];
    acc[m.course_name].push(m);
    return acc;
  }, {});

  return (
    <Navbar>
      <div style={styles.container}>
        <h2 style={styles.heading}>Child's Marks</h2>
        {loading ? <p>Loading...</p> : Object.keys(grouped).length === 0 ? <p>No marks found.</p> : (
          Object.entries(grouped).map(([course, entries]) => (
            <div key={course} style={styles.card}>
              <h3 style={styles.course}>{course}</h3>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thead}>
                    <th style={styles.th}>Exam</th>
                    <th style={styles.th}>Marks Obtained</th>
                    <th style={styles.th}>Max Marks</th>
                    <th style={styles.th}>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => {
                    const pct = ((e.marks_obtained / e.exam_max_marks) * 100).toFixed(1);
                    return (
                      <tr key={e.id} style={styles.tr}>
                        <td style={styles.td}>{e.exam_name}</td>
                        <td style={styles.td}>{e.marks_obtained}</td>
                        <td style={styles.td}>{e.exam_max_marks}</td>
                        <td style={styles.td}>
                          <span style={{ color: pct >= 50 ? '#4caf50' : '#f44336', fontWeight: '600' }}>{pct}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </Navbar>
  );
};

const styles = {
  container: { padding: '32px', background: 'transparent', minHeight: '100vh' },
  heading: { margin: '0 0 24px', color: '#fff' },
  card: { background: 'rgba(255,255,255,0.07)', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '20px' },
  course: { margin: '0 0 16px', color: '#00bcd4' },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: 'rgba(255,255,255,0.05)' },
  th: { padding: '10px 14px', textAlign: 'left', fontSize: '13px', color: 'rgba(255,255,255,0.75)', fontWeight: '600' },
  tr: { borderBottom: '1px solid rgba(255,255,255,0.08)' },
  td: { padding: '10px 14px', fontSize: '14px', color: '#fff' },
};

export default ParentMarks;
