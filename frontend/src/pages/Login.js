import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

const ROLE_REDIRECTS = {
  ADMIN: '/admin/dashboard',
  STUDENT: '/student/dashboard',
  PARENT: '/parent/dashboard',
  STAFF: '/staff/dashboard',
  TUTOR: '/tutor/dashboard',
};

const EyeIcon = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await loginUser(form);
      login(data.user, data.token);
      navigate(ROLE_REDIRECTS[data.user.role]);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <video autoPlay muted loop playsInline style={styles.videoBg}>
        <source src="/campus-bg.mp4" type="video/mp4" />
      </video>
      <div style={styles.videoOverlay} />
      <div style={styles.card}>
        <h2 style={styles.title}>CampusFlow</h2>
        <p style={styles.subtitle}>Sign in to your account</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input className="login-input" style={styles.input} type="email" placeholder="Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <div style={styles.pwWrap}>
            <input className="login-input" style={{...styles.input, marginBottom: 0, paddingRight: '40px'}} type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <span style={styles.eyeBtn} onClick={() => setShowPassword(p => !p)}>
              <EyeIcon open={showPassword} />
            </span>
          </div>
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

      </div>
    </div>
  );
};

const styles = {
  container: { position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  videoBg: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(2px) brightness(0.85)', transform: 'scale(1.05)', zIndex: 0 },
  videoOverlay: { position: 'fixed', inset: 0, background: 'rgba(10, 20, 50, 0.2)', zIndex: 1 },
  card: { position: 'relative', zIndex: 2, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', padding: '40px', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.35)', width: '360px', border: '1px solid rgba(255,255,255,0.2)' },
  title: { textAlign: 'center', color: '#fff', margin: '0 0 4px', fontSize: '26px', fontWeight: 700, letterSpacing: '0.5px' },
  subtitle: { textAlign: 'center', color: 'rgba(255,255,255,0.75)', margin: '0 0 24px', fontSize: '14px' },
  error: { background: 'rgba(198,40,40,0.25)', color: '#ffcdd2', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px', border: '1px solid rgba(198,40,40,0.4)' },
  input: { width: '100%', padding: '10px 12px', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', background: 'rgba(255,255,255,0.15)', color: '#fff', outline: 'none' },
  pwWrap: { position: 'relative', marginBottom: '14px' },
  eyeBtn: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center' },
  adminLink: { textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#90caf9', cursor: 'pointer' },
  button: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #00bcd4, #006064)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer', fontWeight: 600, letterSpacing: '0.3px' },
};

export default Login;
