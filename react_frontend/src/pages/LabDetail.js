import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLabById, getLabHints, submitLabSolution } from '../api/labs';
import Card from '../components/Card';
import Button from '../components/Button';
import HintList from '../components/HintList';
import '../styles/LabDetail.css';

// PUBLIC_INTERFACE
/**
 * Lab detail page with tabs for hints, submission, and discussion
 */
const LabDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lab, setLab] = useState(null);
  const [hints, setHints] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Map lab slugs to interactive lab routes
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
        const [labData, hintsData] = await Promise.all([
          getLabById(id),
          getLabHints(id),
        ]);
        setLab(labData);
        setHints(hintsData);
      } catch (err) {
        setError('Failed to load lab details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);

    try {
      const result = await submitLabSolution(id, answer, hintsUsed);
      setSubmitResult(result);
      if (result.correct) {
        setAnswer('');
      }
    } catch (err) {
      setSubmitResult({
        correct: false,
        message: err.response?.data?.message || 'Submission failed',
      });
      // Display stack trace in dev (intentionally insecure)
      if (process.env.NODE_ENV === 'development' && err.response?.data?.stack) {
        console.error('Backend error stack:', err.response.data.stack);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading lab...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!lab) {
    return <div className="error-container">Lab not found</div>;
  }

  const difficultyColors = {
    beginner: '#06b6d4',
    easy: '#06b6d4',
    intermediate: '#f59e0b',
    medium: '#f59e0b',
    advanced: '#ef4444',
    hard: '#ef4444',
  };

  return (
    <div className="lab-detail">
      <Card className="lab-header">
        <div className="lab-title-section">
          <h1>{lab.title}</h1>
          <div className="lab-meta">
            <span className="lab-category">{lab.category}</span>
            <span
              className="lab-difficulty"
              style={{ color: difficultyColors[lab.difficulty] }}
            >
              {lab.difficulty}
            </span>
          </div>
          
          {labRouteMap[lab.slug] && (
            <Button
              onClick={() => navigate(labRouteMap[lab.slug])}
              style={{marginTop: '15px'}}
            >
              🚀 Launch Interactive Lab
            </Button>
          )}
        </div>
      </Card>

      <div className="lab-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'hints' ? 'active' : ''}`}
          onClick={() => setActiveTab('hints')}
        >
          Hints ({hints.length})
        </button>
        <button
          className={`tab ${activeTab === 'submit' ? 'active' : ''}`}
          onClick={() => setActiveTab('submit')}
        >
          Submit Solution
        </button>
        <button
          className={`tab ${activeTab === 'discussion' ? 'active' : ''}`}
          onClick={() => setActiveTab('discussion')}
        >
          Discussion
        </button>
      </div>

      <div className="lab-content">
        {activeTab === 'overview' && (
          <Card>
            <h2>Objective</h2>
            <p className="lab-description">{lab.description}</p>
            
            {lab.objective && (
              <>
                <h3>Learning Goals</h3>
                <p>{lab.objective}</p>
              </>
            )}

            {lab.owaspCategory && (
              <div className="owasp-section">
                <h3>OWASP Mapping</h3>
                <p><strong>{lab.owaspCategory}</strong></p>
              </div>
            )}

            {lab.tags && lab.tags.length > 0 && (
              <div className="lab-tags">
                <h3>Tags</h3>
                <div className="tags-list">
                  {lab.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'hints' && (
          <Card>
            <HintList hints={hints} />
          </Card>
        )}

        {activeTab === 'submit' && (
          <Card>
            <h2>Submit Your Solution</h2>
            <form onSubmit={handleSubmit} className="submit-form">
              <div className="form-group">
                <label htmlFor="answer">Your Answer</label>
                <textarea
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter your solution or findings here..."
                  rows="6"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="hintsUsed">Hints Used</label>
                <input
                  id="hintsUsed"
                  type="number"
                  value={hintsUsed}
                  onChange={(e) => setHintsUsed(parseInt(e.target.value) || 0)}
                  min="0"
                  max={hints.length}
                />
              </div>

              <Button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Solution'}
              </Button>
            </form>

            {submitResult && (
              <div
                className={`submit-result ${
                  submitResult.correct ? 'success' : 'error'
                }`}
              >
                <h3>{submitResult.correct ? '✓ Correct!' : '✗ Incorrect'}</h3>
                <p>{submitResult.message}</p>
                {submitResult.remediation && (
                  <div className="remediation">
                    <h4>Remediation Guidance</h4>
                    <p>{submitResult.remediation}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {activeTab === 'discussion' && (
          <Card>
            <h2>Discussion</h2>
            <p className="placeholder-text">
              Discussion forum coming soon! This will allow learners to share
              insights and ask questions about this lab.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LabDetail;
