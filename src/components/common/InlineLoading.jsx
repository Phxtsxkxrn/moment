import React from 'react';
import './ui.css';

const InlineLoading = ({ label = 'Loading…' }) => {
  return (
    <div className="loading-inline" role="status" aria-live="polite">
      <div className="spinner spinner--small" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
};

export default InlineLoading;
