import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import API from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});

  useEffect(() => {
    API.get('/dashboard/stats').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.totalUsers ?? '...', color: 'primary', icon: 'bi-people-fill' },
    { label: 'Total Students', value: stats.totalStudents ?? '...', color: 'success', icon: 'bi-mortarboard-fill' },
    { label: 'Total Classrooms', value: stats.totalClassrooms ?? '...', color: 'warning', icon: 'bi-building-fill' },
    { label: 'Total Staff', value: stats.totalStaff ?? '...', color: 'purple', icon: 'bi-person-badge-fill' },
  ];

  return (
    <Navbar>
      <div className="container-fluid p-4">
        <h4 className="cf-heading">Welcome, {user?.name}</h4>
        <p className="cf-subheading">Admin Dashboard</p>
        <div className="row g-4">
          {cards.map(card => (
            <div key={card.label} className="col-sm-6 col-xl-3">
              <div className={`card border-0 h-100 cf-card border-start border-4 border-${card.color}`}>
                <div className="card-body d-flex align-items-center gap-3">
                  <div className={`text-${card.color} fs-2`}>
                    <i className={`bi ${card.icon}`}></i>
                  </div>
                  <div>
                    <div className="fs-3 fw-bold" style={{color:'#fff'}}>{card.value}</div>
                    <div style={{color:'rgba(255,255,255,0.55)', fontSize:'13px'}}>{card.label}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Navbar>
  );
};

export default AdminDashboard;
