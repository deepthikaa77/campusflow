import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div style={styles.container}>
      <h2>403 - Access Denied</h2>
      <p>You don't have permission to view this page.</p>
      <button style={styles.button} onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'transparent' },
  button: { padding: '10px 24px', background: '#00bcd4', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '12px' },
};

export default Unauthorized;
