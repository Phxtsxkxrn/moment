import React from 'react';
import Button from './Button';
import './ui.css';

const EmptyState = ({
  icon = '📭',
  title = 'Nothing to show',
  description = 'No items match this view yet.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state__icon" aria-hidden="true">{icon}</div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__description">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
