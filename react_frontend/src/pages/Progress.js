import React, { useState, useEffect } from 'react';
import { getMyProgress, getProgressSummary, getLeaderboard } from '../api/progress';
import Card from '../components/Card';
import '../styles/Progress.css';

// PUBLIC_INTERFACE
/**
 * Progress tracking page with stats and leaderboard
 */
const Progress = () => {
  const [progress, setProgress] = useState([]);
  const [summary, setSummary] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressData, summaryData, leaderboardData] = await Promise.all([
          getMyProgress(),
          getProgressSummary(),
          getLeaderboard(10),
        ]);
        
        // Defensive: ensure arrays are actually arrays
        setProgress(Array.isArray(progressData) ? progressData : []);
        setSummary(summaryData);
        setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);
      } catch (err) {
        setError('Failed to load progress data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading progress...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="progress-page">
      <h1>Your Progress</h1>

      <div className="progress-overview">
        <Card className="stats-card">
          <h2>Overall Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">{summary?.completed || 0}</div>
              <div className="stat-label">Completed Labs</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{summary?.inProgress || 0}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{summary?.total || 0}</div>
              <div className="stat-label">Total Labs</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {summary?.total > 0
                  ? `${((summary.completed / summary.total) * 100).toFixed(0)}%`
                  : '0%'}
              </div>
              <div className="stat-label">Completion Rate</div>
            </div>
          </div>
        </Card>

        <Card className="leaderboard-card">
          <h2>🏆 Leaderboard</h2>
          {leaderboard.length > 0 ? (
            <div className="leaderboard-list">
              {leaderboard.map((entry, index) => (
                <div key={entry.userId} className="leaderboard-entry">
                  <span className="rank">#{index + 1}</span>
                  <span className="user-name">{entry.displayName || entry.email}</span>
                  <span className="completed-count">{entry.completedCount} labs</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No leaderboard data available yet.</p>
          )}
        </Card>
      </div>

      <Card className="progress-details">
        <h2>Lab-by-Lab Progress</h2>
        {progress.length > 0 ? (
          <div className="progress-table">
            <table>
              <thead>
                <tr>
                  <th>Lab</th>
                  <th>Status</th>
                  <th>Completed</th>
                </tr>
              </thead>
              <tbody>
                {progress.map((item) => (
                  <tr key={item._id}>
                    <td>{item.labTitle || item.labId}</td>
                    <td>
                      <span className={`status-badge status-${item.status}`}>
                        {item.status === 'completed' && '✓ '}
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {item.completedAt
                        ? new Date(item.completedAt).toLocaleDateString()
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No progress recorded yet. Start a lab to track your progress!</p>
        )}
      </Card>
    </div>
  );
};

export default Progress;
