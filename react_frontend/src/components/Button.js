import React from 'react';
import '../styles/Button.css';

// PUBLIC_INTERFACE
/**
 * Reusable button component with consistent styling
 * @param {object} props - Component props
 * @param {React.ReactNode} props.children - Button text/content
 * @param {string} props.variant - Button style variant (primary, secondary, danger)
 * @param {function} props.onClick - Click handler
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {string} props.type - Button type (button, submit, reset)
 * @param {string} props.className - Additional CSS classes
 */
const Button = ({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  type = 'button',
  className = '',
}) => {
  return (
    <button
      type={type}
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
