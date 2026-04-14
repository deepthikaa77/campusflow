const Modal = ({ title, onClose, children }) => (
  <div style={styles.overlay}>
    <div style={styles.modal}>
      <div style={styles.header}>
        <h3 style={styles.title}>{title}</h3>
        <button style={styles.close} onClick={onClose}>✕</button>
      </div>
      <div style={styles.body}>{children}</div>
    </div>
  </div>
);

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', width: '480px', maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  title: { margin: 0, fontSize: '16px', color: '#fff' },
  close: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' },
  body: { padding: '20px' },
};

export default Modal;
