const COLORS = {
  PENDING:     { bg: '#fff3e0', color: '#e65100' },
  RESPONDED:   { bg: '#e8f5e9', color: '#2e7d32' },
  CLOSED:      { bg: '#eeeeee', color: '#616161' },
  IN_PROGRESS: { bg: '#e3f2fd', color: '#1565c0' },
  RESOLVED:    { bg: '#e8f5e9', color: '#2e7d32' },
};

const StatusBadge = ({ status }) => {
  const style = COLORS[status] || COLORS.PENDING;
  return (
    <span style={{ ...styles.badge, ...style }}>{status}</span>
  );
};

const styles = {
  badge: { padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' },
};

export default StatusBadge;
