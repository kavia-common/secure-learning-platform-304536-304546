import React, { useState, useEffect } from 'react';
import { getLabs } from '../api/labs';
import { getMyProgress } from '../api/progress';
import LabCard from '../components/LabCard';
import '../styles/Labs.css';

// PUBLIC_INTERFACE
/**
 * Labs listing page with search and filtering
 */
const Labs = () => {
  const [labs, setLabs] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [labsData, progressData] = await Promise.all([
          getLabs(),
          getMyProgress(),
        ]);
        
        // Defensive: ensure both are arrays before setting state
        setLabs(Array.isArray(labsData) ? labsData : []);
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
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];
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
      <h1>Security Labs</h1>

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
          <LabCard key={lab._id} lab={lab} status={getLabStatus(lab._id)} />
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
