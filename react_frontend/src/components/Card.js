import React from 'react';
import '../styles/Card.css';

// PUBLIC_INTERFACE
/**
 * Reusable card component for displaying content in a styled container
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional CSS classes
 * @param {function} props.onClick - Click handler
 * @param {boolean} props.clickable - Whether card is clickable
 */
const Card = ({ children, className = '', onClick, clickable = false }) => {
  return (
    <div
      className={`card ${clickable ? 'card-clickable' : ''} ${className}`}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => e.key === 'Enter' && onClick?.(e) : undefined}
    >
      {children}
    </div>
  );
};

export default Card;
