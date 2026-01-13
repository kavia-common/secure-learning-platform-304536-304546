import React, { useState, useEffect } from 'react';
import { getUsers, updateUserRoles, resetUserProgress } from '../api/admin';
import { getLabs, deleteLab } from '../api/labs';
import Card from '../components/Card';
import Button from '../components/Button';
import '../styles/Admin.css';

// PUBLIC_INTERFACE
/**
 * Admin page for managing users and labs
 */
const Admin = () => {
  const [users, setUsers] = useState([]);
  const [labs, setLabs] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersData, labsData] = await Promise.all([getUsers(), getLabs()]);
      setUsers(usersData);
      setLabs(labsData);
    } catch (err) {
      setError('Failed to load admin data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (userId, currentRoles) => {
    try {
      const isAdmin = currentRoles.includes('admin');
      const newRoles = isAdmin
        ? currentRoles.filter((r) => r !== 'admin')
        : [...currentRoles, 'admin'];

      await updateUserRoles(userId, newRoles);
      setMessage(`User roles updated successfully`);
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to update user roles');
      console.error(err);
    }
  };

  const handleResetUser = async (userId) => {
    if (!window.confirm('Are you sure you want to reset this user\'s progress?')) {
      return;
    }

    try {
      await resetUserProgress(userId);
      setMessage('User progress reset successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to reset user progress');
      console.error(err);
    }
  };

  const handleDeleteLab = async (labId) => {
    if (!window.confirm('Are you sure you want to delete this lab?')) {
      return;
    }

    try {
      await deleteLab(labId);
      setMessage('Lab deleted successfully');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to delete lab');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading admin panel...</div>;
  }

  return (
    <div className="admin-page">
      <h1>⚙️ Admin Panel</h1>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="admin-tabs">
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </button>
        <button
          className={`tab ${activeTab === 'labs' ? 'active' : ''}`}
          onClick={() => setActiveTab('labs')}
        >
          Labs ({labs.length})
        </button>
      </div>

      {activeTab === 'users' && (
        <Card>
          <h2>User Management</h2>
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Display Name</th>
                  <th>Roles</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.email}</td>
                    <td>{user.displayName || '-'}</td>
                    <td>
                      <span className="roles-list">
                        {user.roles?.join(', ') || 'user'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Button
                          variant={user.roles?.includes('admin') ? 'danger' : 'secondary'}
                          onClick={() => handleToggleAdmin(user._id, user.roles || ['user'])}
                        >
                          {user.roles?.includes('admin') ? 'Remove Admin' : 'Make Admin'}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => handleResetUser(user._id)}
                        >
                          Reset Progress
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'labs' && (
        <Card>
          <h2>Lab Management</h2>
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {labs.map((lab) => (
                  <tr key={lab._id}>
                    <td>{lab.title}</td>
                    <td>{lab.category}</td>
                    <td>{lab.difficulty}</td>
                    <td>
                      <div className="action-buttons">
                        <Button
                          variant="danger"
                          onClick={() => handleDeleteLab(lab._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="admin-note">
            Note: Lab creation and editing UI coming soon. Use the API directly for now.
          </p>
        </Card>
      )}
    </div>
  );
};

export default Admin;
