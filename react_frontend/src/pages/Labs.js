import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLabs } from '../api/labs';
import { getMyProgress } from '../api/progress';
import LabCard from '../components/LabCard';
import '../styles/Labs.css';

// PUBLIC_INTERFACE
/**
 * Labs listing page with search and filtering
 */
const Labs = () => {
  const navigate = useNavigate();
  const [labs, setLabs] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Map lab slugs to interactive routes
  const labRouteMap = {
    'level-1-stored-xss': '/lab/stored-xss',
    'level-2-reflected-xss': '/lab/reflected-xss',
    'level-3-dom-xss': '/lab/dom-xss',
    'level-4-nosql-injection': '/lab/nosql-injection',
    'level-5-broken-auth': '/lab/broken-auth',
    'level-6-idor': '/lab/idor',
    'level-7-csrf': '/lab/csrf',
    'level-8-file-upload': '/lab/file-upload',
    'level-9-command-injection': '/lab/command-injection',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [labsData, progressData] = await Promise.all([
          getLabs(),
          getMyProgress(),
        ]);
        
        // Sort by level if available
        const sortedLabs = Array.isArray(labsData) ? labsData.sort((a, b) => (a.level || 999) - (b.level || 999)) : [];
        
        // Defensive: ensure both are arrays before setting state
        setLabs(sortedLabs);
        setProgress(Array.isArray(progressData) ? progressData : []);
      } catch (err) {
        setError('Failed to load labs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getLabStatus = (labId) => {
    // Defensive: ensure progress is array before calling find
    if (!Array.isArray(progress)) {
      return 'not_started';
    }
    const labProgress = progress.find((p) => p.labId === labId);
    return labProgress?.status || 'not_started';
  };

  // Defensive: ensure labs is array before calling filter
  const filteredLabs = Array.isArray(labs) ? labs.filter((lab) => {
    const matchesSearch =
      lab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lab.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || lab.category === categoryFilter;
    const matchesDifficulty =
      difficultyFilter === 'all' || lab.difficulty === difficultyFilter;
    const matchesStatus =
      statusFilter === 'all' || getLabStatus(lab._id) === statusFilter;

    return matchesSearch && matchesCategory && matchesDifficulty && matchesStatus;
  }) : [];

  // Defensive: ensure labs is array before mapping
  const categories = ['all', ...new Set(Array.isArray(labs) ? labs.map((lab) => lab.category) : [])];
  const difficulties = ['all', 'easy', 'medium', 'hard'];
  const statuses = [
    { value: 'all', label: 'All Status' },
    { value: 'not_started', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ];

  if (loading) {
    return <div className="loading">Loading labs...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="labs-page">
      <div className="labs-header">
        <h1>🎯 Security Labs - Level Progression</h1>
        <p>Complete labs in order to unlock higher levels. Practice web security vulnerabilities in a safe environment.</p>
        <div style={{
          background: '#fef3c7',
          padding: '15px',
          borderRadius: '8px',
          marginTop: '15px',
          border: '1px solid #f59e0b'
        }}>
          <strong>🏆 CTF Side Quest:</strong> 20 hidden flags scattered throughout the application.
          Find them via source code, network inspection, and creative hacking!
        </div>
      </div>

      <div className="labs-filters">
        <input
          type="text"
          placeholder="Search labs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-select"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="filter-select"
        >
          {difficulties.map((diff) => (
            <option key={diff} value={diff}>
              {diff === 'all' ? 'All Difficulties' : diff}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          {statuses.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      <div className="labs-count">
        Showing {filteredLabs.length} of {labs.length} labs
      </div>

      <div className="labs-grid">
        {filteredLabs.map((lab) => (
          <div key={lab._id} style={{ position: 'relative' }}>
            <LabCard lab={lab} status={getLabStatus(lab._id)} />
            {labRouteMap[lab.slug] && (
              <button
                onClick={() => navigate(labRouteMap[lab.slug])}
                className="launch-lab-btn"
                style={{
                  marginTop: '10px',
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                🚀 Launch Lab
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredLabs.length === 0 && (
        <div className="no-results">
          No labs found matching your criteria. Try adjusting your filters.
        </div>
      )}
    </div>
  );
};

export default Labs;
