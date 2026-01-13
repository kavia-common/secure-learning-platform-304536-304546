import React, { useState } from 'react';
import Button from './Button';
import '../styles/HintList.css';

// PUBLIC_INTERFACE
/**
 * Progressive hint disclosure component
 * @param {object} props - Component props
 * @param {Array} props.hints - Array of hint objects
 */
const HintList = ({ hints = [] }) => {
  const [revealedCount, setRevealedCount] = useState(0);

  const revealNext = () => {
    if (revealedCount < hints.length) {
      setRevealedCount(revealedCount + 1);
    }
  };

  return (
    <div className="hint-list">
      <h3>Hints</h3>
      {hints.length === 0 ? (
        <p className="no-hints">No hints available for this lab.</p>
      ) : (
        <>
          <div className="hints-container">
            {hints.slice(0, revealedCount).map((hint, index) => (
              <div key={hint._id || index} className="hint-item">
                <div className="hint-number">Hint {index + 1}</div>
                <div className="hint-content">{hint.content}</div>
              </div>
            ))}
          </div>
          {revealedCount < hints.length && (
            <Button variant="secondary" onClick={revealNext}>
              Reveal Hint {revealedCount + 1} of {hints.length}
            </Button>
          )}
          {revealedCount > 0 && (
            <p className="hints-used">
              You've used {revealedCount} of {hints.length} hints
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default HintList;
