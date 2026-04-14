import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { getNotifications, markAsRead, markAllAsRead } from '../services/api';

const TYPE_COLORS = {
  QUERY:        { bg: '#e3f2fd', color: '#1565c0' },
  GRIEVANCE:    { bg: '#fce4ec', color: '#880e4f' },
  COMPLAINT:    { bg: '#fff3e0', color: '#ffcc80' },
  ANNOUNCEMENT: { bg: '#e8f5e9', color: '#69f0ae' },
  GENERAL:      { bg: '#f3e5f5', color: '#6a1b9a' },
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = () =>
    getNotifications()
      .then(({ data }) => setNotifications(data))
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => { fetchNotifications(); }, []);

  const handleRead = async (id) => {
    await markAsRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleReadAll = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unread = notifications.filter((n) => !n.is_read).length;

  return (
    <Navbar>
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.heading}>Notifications {unread > 0 && <span style={styles.badge}>{unread} new</span>}</h2>
          {unread > 0 && <button style={styles.btn} onClick={handleReadAll}>Mark all as read</button>}
        </div>
        {loading ? <p>Loading...</p> : (
          <>
            {notifications.map((n) => {
              const typeStyle = TYPE_COLORS[n.type] || TYPE_COLORS.GENERAL;
              return (
                <div key={n.id} style={{ ...styles.card, opacity: n.is_read ? 0.6 : 1 }} onClick={() => !n.is_read && handleRead(n.id)}>
                  <div style={styles.cardLeft}>
                    <span style={{ ...styles.type, background: typeStyle.bg, color: typeStyle.color }}>{n.type}</span>
                    <div>
                      <p style={styles.title}>{n.title}</p>
                      {n.message && <p style={styles.msg}>{n.message}</p>}
                      <p style={styles.time}>{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  {!n.is_read && <span style={styles.dot} />}
                </div>
              );
            })}
            {!notifications.length && <p>No notifications yet.</p>}
          </>
        )}
      </div>
    </Navbar>
  );
};

const styles = {
  container: { padding: '32px', background: 'transparent', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  heading: { margin: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '12px' },
  badge: { background: '#00bcd4', color: '#fff', fontSize: '13px', padding: '2px 10px', borderRadius: '12px', fontWeight: 'normal' },
  btn: { background: 'transparent', border: '1px solid #00bcd4', color: '#00bcd4', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' },
  card: { background: 'rgba(255,255,255,0.07)', borderRadius: '10px', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  cardLeft: { display: 'flex', gap: '16px', alignItems: 'flex-start' },
  type: { padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap', marginTop: '2px' },
  title: { margin: '0 0 4px', fontWeight: '600', color: '#fff', fontSize: '14px' },
  msg: { margin: '0 0 4px', color: 'rgba(255,255,255,0.75)', fontSize: '13px' },
  time: { margin: 0, fontSize: '12px', color: '#aaa' },
  dot: { width: '10px', height: '10px', borderRadius: '50%', background: '#00bcd4', flexShrink: 0 },
};

export default Notifications;
