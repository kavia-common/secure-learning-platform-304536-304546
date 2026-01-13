import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './Card';
import '../styles/LabCard.css';

// PUBLIC_INTERFACE
/**
 * Lab card component for displaying lab summary
 * @param {object} props - Component props
 * @param {object} props.lab - Lab object
 * @param {string} props.status - Lab completion status
 */
const LabCard = ({ lab, status = 'not_started' }) => {
  const navigate = useNavigate();

  const difficultyColors = {
    beginner: '#06b6d4',
    intermediate: '#f59e0b',
    advanced: '#ef4444',
  };

  const statusLabels = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    completed: '✓ Completed',
  };

  return (
    <Card clickable onClick={() => navigate(`/labs/${lab._id}`)}>
      <div className="lab-card">
        <div className="lab-card-header">
          <h3 className="lab-card-title">{lab.title}</h3>
          <span
            className={`status-badge status-${status}`}
          >
            {statusLabels[status]}
          </span>
        </div>
        <p className="lab-card-description">{lab.description}</p>
        <div className="lab-card-footer">
          <span className="lab-category">{lab.category}</span>
          <span
            className="lab-difficulty"
            style={{ color: difficultyColors[lab.difficulty] }}
          >
            {lab.difficulty}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default LabCard;
