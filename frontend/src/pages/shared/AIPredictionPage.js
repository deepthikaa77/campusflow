import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';

const AIPredictionPage = ({ title, subtitle, fetchFn }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSubject, setActiveSubject] = useState(null);

  useEffect(() => {
    fetchFn()
      .then(r => {
        setData(r.data);
        const keys = Object.keys(r.data);
        if (keys.length > 0) setActiveSubject(keys[0]);
      })
      .catch(() => setError('Failed to load AI analysis. Make sure Ollama is running.'))
      .finally(() => setLoading(false));
  }, []);

  const subjects = data ? Object.keys(data) : [];

  return (
    <Navbar>
      <div className="container-fluid p-4">
        <h4 className="cf-heading" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <i className="bi bi-robot" style={{ color: '#00bcd4' }} /> {title}
        </h4>
        <p className="cf-subheading">{subtitle}</p>

        {loading && (
          <div style={s.loadingBox}>
            <div className="spinner-border text-info" role="status" />
            <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: 12 }}>
              Analyzing with AI... this may take a moment
            </p>
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        {!loading && data && subjects.length === 0 && (
          <div style={s.emptyBox}>No subjects found.</div>
        )}

        {!loading && data && subjects.length > 0 && (
          <div style={s.layout}>
            <div style={s.tabs}>
              {subjects.map(sub => (
                <div
                  key={sub}
                  style={{ ...s.tab, ...(activeSubject === sub ? s.tabActive : {}) }}
                  onClick={() => setActiveSubject(sub)}
                >
                  <i className="bi bi-book-fill" style={{ marginRight: 8, fontSize: 13 }} />
                  {sub}
                </div>
              ))}
            </div>

            {activeSubject && (
              <div style={s.panel}>
                <div style={s.panelHeader}>
                  <i className="bi bi-stars" style={{ color: '#00bcd4', marginRight: 8 }} />
                  AI Analysis — {activeSubject}
                </div>
                <div style={s.analysisText}>
                  {data[activeSubject].split('\n').map((line, i) =>
                    line.trim() ? <p key={i} style={{ marginBottom: 8 }}>{line}</p> : null
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Navbar>
  );
};

const s = {
  loadingBox: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: 300,
  },
  emptyBox: { color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginTop: 60, fontSize: 16 },
  layout: { display: 'flex', gap: 20, alignItems: 'flex-start' },
  tabs: { minWidth: 200, display: 'flex', flexDirection: 'column', gap: 6 },
  tab: {
    padding: '10px 16px', borderRadius: 8, cursor: 'pointer',
    background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.65)',
    fontSize: 13, border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.15s',
  },
  tabActive: {
    background: 'rgba(0,188,212,0.2)', color: '#00bcd4',
    border: '1px solid rgba(0,188,212,0.4)', fontWeight: 600,
  },
  panel: {
    flex: 1, background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden',
  },
  panelHeader: {
    padding: '14px 20px', fontWeight: 600, fontSize: 15,
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', background: 'rgba(0,188,212,0.1)',
  },
  analysisText: { padding: '20px', color: 'rgba(255,255,255,0.82)', fontSize: 14, lineHeight: 1.7 },
};

export default AIPredictionPage;
