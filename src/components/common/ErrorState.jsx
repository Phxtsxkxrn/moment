import React from 'react';
import Button from './Button';
import './ui.css';

const ErrorState = ({
  icon = '⚠️',
  title = 'Something went wrong',
  description = 'Please try again or refresh the page.',
  retryLabel = 'Retry',
  onRetry,
}) => {
  return (
    <div className="error-state" role="alert">
      <div className="error-state__icon" aria-hidden="true">{icon}</div>
      <h3 className="error-state__title">{title}</h3>
      <p className="error-state__description">{description}</p>
      {onRetry && (
        <div className="error-state__actions">
          <Button variant="secondary" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
