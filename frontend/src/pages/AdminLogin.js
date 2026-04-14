import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

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

const AdminLogin = () => {
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
      if (data.user.role !== 'ADMIN') {
        setError('Access denied. This login is for admins only.');
        return;
      }
      login(data.user, data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.badge}>ADMIN</div>
        <h2 style={styles.title}>CampusFlow</h2>
        <p style={styles.subtitle}>Admin Portal</p>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <input style={styles.input} type="email" placeholder="Admin Email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <div style={styles.pwWrap}>
            <input style={{...styles.input, marginBottom: 0, paddingRight: '40px'}} type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <span style={styles.eyeBtn} onClick={() => setShowPassword(p => !p)}>
              <EyeIcon open={showPassword} />
            </span>
          </div>
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In as Admin'}
          </button>
        </form>
        <p style={styles.link} onClick={() => navigate('/login')}>← Back to Student/Staff Login</p>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e' },
  card: { background: 'rgba(255,255,255,0.07)', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', width: '360px' },
  badge: { background: '#e53935', color: '#fff', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, display: 'inline-block', marginBottom: '12px' },
  title: { textAlign: 'center', color: '#1a1a2e', margin: '0 0 4px' },
  subtitle: { textAlign: 'center', color: 'rgba(255,255,255,0.6)', margin: '0 0 24px', fontSize: '14px' },
  error: { background: 'rgba(198,40,40,0.25)', color: '#ff8a80', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' },
  input: { width: '100%', padding: '10px 12px', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
  pwWrap: { position: 'relative', marginBottom: '14px' },
  eyeBtn: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center' },
  button: { width: '100%', padding: '12px', background: '#e53935', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '15px', cursor: 'pointer' },
  link: { textAlign: 'center', marginTop: '16px', fontSize: '13px', color: '#00bcd4', cursor: 'pointer' },
};

export default AdminLogin;
