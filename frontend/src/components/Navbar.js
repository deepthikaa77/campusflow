import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUnreadCount } from '../services/api';

const NAV_LINKS = {
  ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: 'bi-speedometer2' },
    { label: 'Users', path: '/admin/users', icon: 'bi-people-fill' },
    { label: 'Classrooms', path: '/admin/classrooms', icon: 'bi-building-fill' },
    { label: 'Students', path: '/admin/students', icon: 'bi-mortarboard-fill' },
    { label: 'Subjects', path: '/admin/subjects', icon: 'bi-book-fill' },
    { label: 'Attendance', path: '/admin/attendance', icon: 'bi-calendar-check-fill' },
    { label: 'Marks', path: '/admin/marks', icon: 'bi-clipboard-data-fill' },
    { label: 'Queries', path: '/admin/queries', icon: 'bi-chat-dots-fill' },
  ],
  STUDENT: [
    { label: 'Dashboard', path: '/student/dashboard', icon: 'bi-speedometer2' },
    { label: 'Timetable', path: '/timetable', icon: 'bi-calendar3' },
    { label: 'Attendance', path: '/student/attendance', icon: 'bi-calendar-check-fill' },
    { label: 'Marks', path: '/student/marks', icon: 'bi-clipboard-data-fill' },
    { label: 'Queries', path: '/student/queries', icon: 'bi-chat-dots-fill' },
    { label: 'Complaints', path: '/student/complaints', icon: 'bi-exclamation-circle-fill' },
    { label: 'Grievances', path: '/student/grievances', icon: 'bi-flag-fill' },
    { label: 'AI Analysis', path: '/student/ai', icon: 'bi-robot' },
  ],
  PARENT: [
    { label: 'Dashboard', path: '/parent/dashboard', icon: 'bi-speedometer2' },
    { label: 'Timetable', path: '/timetable', icon: 'bi-calendar3' },
    { label: 'Attendance', path: '/parent/attendance', icon: 'bi-calendar-check-fill' },
    { label: 'Marks', path: '/parent/marks', icon: 'bi-clipboard-data-fill' },
    { label: 'Complaints', path: '/parent/complaints', icon: 'bi-exclamation-circle-fill' },
  ],
  STAFF: [
    { label: 'Dashboard', path: '/staff/dashboard', icon: 'bi-speedometer2' },
    { label: 'Timetable', path: '/timetable', icon: 'bi-calendar3' },
    { label: 'Attendance', path: '/staff/attendance', icon: 'bi-calendar-check-fill' },
    { label: 'Marks', path: '/staff/marks', icon: 'bi-clipboard-data-fill' },
    { label: 'Queries', path: '/staff/queries', icon: 'bi-chat-dots-fill' },
    { label: 'AI Analysis', path: '/staff/ai', icon: 'bi-robot' },
  ],
  TUTOR: [
    { label: 'Dashboard', path: '/tutor/dashboard', icon: 'bi-speedometer2' },
    { label: 'Timetable', path: '/tutor/timetable', icon: 'bi-calendar3' },
    { label: 'Students', path: '/tutor/students', icon: 'bi-mortarboard-fill' },
    { label: 'Mark Attendance', path: '/tutor/mark-attendance', icon: 'bi-pencil-square' },
    { label: 'Attendance', path: '/tutor/attendance', icon: 'bi-calendar-check-fill' },
    { label: 'Marks', path: '/tutor/marks', icon: 'bi-clipboard-data-fill' },
    { label: 'Complaints', path: '/tutor/complaints', icon: 'bi-exclamation-circle-fill' },
    { label: 'Grievances', path: '/tutor/grievances', icon: 'bi-flag-fill' },
    { label: 'Queries', path: '/tutor/queries', icon: 'bi-chat-dots-fill' },
    { label: 'AI Analysis', path: '/tutor/ai', icon: 'bi-robot' },
  ],
};

const SIDEBAR_WIDTH = 220;

const Navbar = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    getUnreadCount().then(({ data }) => setUnread(data.count)).catch(() => {});
    const interval = setInterval(() => {
      getUnreadCount().then(({ data }) => setUnread(data.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };
  const links = NAV_LINKS[user?.role] || [];

  return (
    <div style={s.wrapper}>
      {/* Sidebar */}
      <aside style={s.sidebar}>
        <div style={s.brandSection}>
          <div style={s.brand} onClick={() => navigate(`/${user?.role?.toLowerCase()}/dashboard`)}>
            CampusFlow
          </div>
          <div style={s.roleTag}>{user?.role}</div>
        </div>
        <nav style={s.nav}>
          {links.map(link => {
            const isActive = location.pathname === link.path;
            return (
              <div
                key={link.path}
                style={{ ...s.navItem, ...(isActive ? s.navItemActive : {}) }}
                onClick={() => navigate(link.path)}
              >
                <i className={`bi ${link.icon}`} style={s.navIcon} />
                <span>{link.label}</span>
                {isActive && <div style={s.activeBar} />}
              </div>
            );
          })}
        </nav>
        <div style={s.sidebarBottom}>
          <div style={s.userInfo}>
            <div style={s.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
            <div style={s.userName}>{user?.name}</div>
          </div>
          <div style={s.bottomActions}>
            <div style={s.bottomBtn} onClick={() => navigate('/notifications')}>
              <i className="bi bi-bell-fill" />
              {unread > 0 && <span style={s.badge}>{unread}</span>}
            </div>
            <div style={s.bottomBtn} onClick={handleLogout}>
              <i className="bi bi-box-arrow-right" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={s.main}>
        {children}
      </main>
    </div>
  );
};

const s = {
  wrapper: { display: 'flex', minHeight: '100vh' },
  sidebar: {
    width: `${SIDEBAR_WIDTH}px`, minWidth: `${SIDEBAR_WIDTH}px`,
    background: 'linear-gradient(180deg, #006064 0%, #00bcd4 100%)',
    color: '#fff',
    display: 'flex', flexDirection: 'column',
    position: 'fixed', top: 0, left: 0, bottom: 0,
    zIndex: 100, boxShadow: '2px 0 16px rgba(0,0,0,0.2)',
  },
  brandSection: {
    padding: '24px 20px 14px',
    borderBottom: '1px solid rgba(255,255,255,0.15)',
  },
  brand: {
    fontWeight: 700, fontSize: '22px', cursor: 'pointer',
    letterSpacing: '0.5px', marginBottom: '4px',
  },
  roleTag: {
    fontSize: '11px', opacity: 0.65, textTransform: 'uppercase',
    letterSpacing: '1.5px', fontWeight: '500',
  },
  nav: { flex: 1, padding: '12px 0', overflowY: 'auto' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '11px 20px', cursor: 'pointer', fontSize: '14px',
    opacity: 0.75, position: 'relative', transition: 'all 0.15s',
    borderRadius: '0',
  },
  navItemActive: {
    opacity: 1, fontWeight: '600',
    background: 'rgba(255,255,255,0.18)',
  },
  activeBar: {
    position: 'absolute', right: 0, top: '6px', bottom: '6px',
    width: '3px', background: '#fff', borderRadius: '2px 0 0 2px',
  },
  navIcon: { fontSize: '15px', width: '18px', textAlign: 'center' },
  sidebarBottom: {
    borderTop: '1px solid rgba(255,255,255,0.15)',
    padding: '14px 16px',
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.25)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 'bold', fontSize: '15px', flexShrink: 0,
    border: '2px solid rgba(255,255,255,0.4)',
  },
  userName: { fontSize: '13px', fontWeight: '600' },
  bottomActions: { display: 'flex', gap: '8px' },
  bottomBtn: {
    position: 'relative', cursor: 'pointer', fontSize: '17px',
    padding: '7px 12px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    transition: 'background 0.15s',
  },
  badge: {
    position: 'absolute', top: '-4px', right: '-4px',
    background: '#f44336', color: '#fff', borderRadius: '50%',
    fontSize: '10px', padding: '1px 4px', lineHeight: '1.2',
  },
  main: {
    marginLeft: `${SIDEBAR_WIDTH}px`,
    flex: 1, minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1b3e 100%)',
  },
};

export default Navbar;
