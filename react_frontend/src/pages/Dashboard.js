import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLabs } from '../api/labs';
import { getProgressSummary } from '../api/progress';
import LabCard from '../components/LabCard';
import Card from '../components/Card';
import '../styles/Dashboard.css';

// PUBLIC_INTERFACE
/**
 * Dashboard page showing overview and recent labs
 */
const Dashboard = () => {
  const [labs, setLabs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [labsData, summaryData] = await Promise.all([
          getLabs(),
          getProgressSummary(),
        ]);
        
        // Defensive: ensure labsData is an array before slicing
        const labsArray = Array.isArray(labsData) ? labsData : [];
        setLabs(labsArray.slice(0, 6)); // Show first 6 labs
        setSummary(summaryData);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="dashboard-grid">
        <Card className="summary-card">
          <h2>Your Progress</h2>
          <div className="progress-stats">
            <div className="stat">
              <div className="stat-value">{summary?.completed || 0}</div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat">
              <div className="stat-value">{summary?.inProgress || 0}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat">
              <div className="stat-value">{summary?.total || 0}</div>
              <div className="stat-label">Total Labs</div>
            </div>
          </div>
          {summary?.total > 0 && (
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${((summary.completed / summary.total) * 100).toFixed(0)}%`,
                }}
              />
            </div>
          )}
        </Card>

        <Card className="quick-links-card">
          <h2>Quick Links</h2>
          <div className="quick-links">
            <Link to="/labs" className="quick-link">
              🧪 Browse All Labs
            </Link>
            <Link to="/progress" className="quick-link">
              📈 View Progress
            </Link>
            <a
              href={`${process.env.REACT_APP_API_BASE || 'http://localhost:3001'}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              className="quick-link"
            >
              📚 API Documentation
            </a>
          </div>
        </Card>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Labs</h2>
          <Link to="/labs" className="view-all-link">
            View All →
          </Link>
        </div>
        <div className="labs-grid">
          {labs.map((lab) => {
            const labProgress = summary?.progressByLab?.find(
              (p) => p.labId === lab._id
            );
            return (
              <LabCard
                key={lab._id}
                lab={lab}
                status={labProgress?.status || 'not_started'}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
