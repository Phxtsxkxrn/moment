import React from 'react';
import './ui.css';

const FullPageLoading = ({ message = 'Loading content…' }) => {
  return (
    <div className="loading-page" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
};

export default FullPageLoading;
