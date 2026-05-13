import React from 'react';
import './ui.css';

const Button = ({
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  children,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`button button--${variant} button--${size} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
