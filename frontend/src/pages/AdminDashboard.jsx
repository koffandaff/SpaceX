// pages/AdminDashboard.js - Admin user management with real approval logic
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const { approveUser, rejectUser, getAllUsers } = useAuth();

  // Load users from the database
  useEffect(() => {
    const loadUsers = () => {
      const allUsers = getAllUsers();
      setUsers(allUsers);
    };
    
    loadUsers();
  }, [getAllUsers]);

  // Refresh users list after approval/rejection
  const refreshUsers = () => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
  };

  const handleApprove = (userId) => {
    const updatedUsers = approveUser(userId);
    setUsers(updatedUsers);
  };

  const handleReject = (userId) => {
    const updatedUsers = rejectUser(userId);
    setUsers(updatedUsers);
  };

  // Filter users based on status
  const pendingUsers = users.filter(user => user.status === 'pending');
  const approvedUsers = users.filter(user => user.status === 'approved');

  // Get user counts for statistics
  const userCounts = {
    total: users.length,
    pending: pendingUsers.length,
    approved: approvedUsers.length,
    admins: approvedUsers.filter(user => user.role === 'admin').length,
    scientists: approvedUsers.filter(user => user.role === 'scientist').length,
    regularUsers: approvedUsers.filter(user => user.role === 'user').length,
  };

  return (
    <div className="predict-main">
      <div className="glass-card">
        <h1 className="page-title">Admin Dashboard</h1>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button 
            className={`pill-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
          <button 
            className={`pill-btn ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            System Stats
          </button>
        </div>

        {activeTab === 'users' && (
          <div>
            {/* Pending Approvals Section */}
            <div className="section-title">Pending Approvals</div>
            {pendingUsers.length > 0 ? (
              <div style={{ marginBottom: '2rem' }}>
                {pendingUsers.map(user => (
                  <div key={user.id} className="glass-card" style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', color: '#88ffff' }}>
                        {user.name || user.email.split('@')[0]}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#aaffff' }}>
                        {user.email}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#88ffff', marginTop: '0.5rem' }}>
                        Role: <strong>{user.role.toUpperCase()}</strong> • 
                        Applied: {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="pill-btn"
                        onClick={() => handleApprove(user.id)}
                        style={{ 
                          padding: '0.4rem 1rem', 
                          fontSize: '0.7rem',
                          background: 'rgba(136, 255, 136, 0.1)',
                          borderColor: '#88ff88'
                        }}
                      >
                        Approve
                      </button>
                      <button 
                        className="pill-btn"
                        onClick={() => handleReject(user.id)}
                        style={{ 
                          padding: '0.4rem 1rem', 
                          fontSize: '0.7rem',
                          background: 'rgba(255, 136, 136, 0.1)',
                          borderColor: '#ff8888'
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                color: '#88ffff',
                fontStyle: 'italic'
              }}>
                No pending approval requests.
              </div>
            )}
            
            {/* All Users Section */}
            <div className="section-title">All Users ({approvedUsers.length})</div>
            {approvedUsers.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse',
                  fontSize: '0.8rem'
                }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #44ffff' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: '#88ffff' }}>Name</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: '#88ffff' }}>Email</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: '#88ffff' }}>Role</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', color: '#88ffff' }}>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedUsers.map(user => (
                      <tr key={user.id} style={{ borderBottom: '1px solid rgba(68, 255, 255, 0.3)' }}>
                        <td style={{ padding: '0.75rem', color: '#aaffff' }}>
                          {user.name || user.email.split('@')[0]}
                        </td>
                        <td style={{ padding: '0.75rem', color: '#aaffff' }}>{user.email}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ 
                            color: user.role === 'admin' ? '#ff8888' : 
                                   user.role === 'scientist' ? '#88ff88' : '#8888ff',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            fontSize: '0.7rem'
                          }}>
                            {user.role}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', color: '#aaffff', fontSize: '0.7rem' }}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '2rem', 
                color: '#88ffff',
                fontStyle: 'italic'
              }}>
                No approved users yet.
              </div>
            )}
          </div>
        )}

        {activeTab === 'system' && (
          <div>
            <h2>System Statistics</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1.5rem', 
              marginTop: '1.5rem' 
            }}>
              <div className="glass-card" style={{ textAlign: 'center' }}>
                <h3>Total Users</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#88ffff' }}>
                  {userCounts.total}
                </p>
              </div>
              <div className="glass-card" style={{ textAlign: 'center' }}>
                <h3>Pending Approvals</h3>
                <p style={{ 
                  fontSize: '2rem', 
                  fontWeight: 'bold', 
                  color: userCounts.pending > 0 ? '#ff8888' : '#88ffff' 
                }}>
                  {userCounts.pending}
                </p>
              </div>
              <div className="glass-card" style={{ textAlign: 'center' }}>
                <h3>Active Scientists</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#88ff88' }}>
                  {userCounts.scientists}
                </p>
              </div>
              <div className="glass-card" style={{ textAlign: 'center' }}>
                <h3>Regular Users</h3>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8888ff' }}>
                  {userCounts.regularUsers}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: '2rem' }}>
              <h3>Quick Actions</h3>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                <button 
                  className="pill-btn"
                  onClick={() => setActiveTab('users')}
                  style={{ background: 'rgba(136, 255, 255, 0.1)' }}
                >
                  View Pending Requests
                </button>
                <button 
                  className="pill-btn"
                  onClick={() => {
                    // Refresh data
                    refreshUsers();
                  }}
                  style={{ background: 'rgba(136, 255, 136, 0.1)' }}
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;