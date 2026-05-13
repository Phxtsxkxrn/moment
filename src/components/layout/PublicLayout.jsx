import React from 'react';
import PageContainer from './PageContainer';

/**
 * PublicLayout - Used for public-facing pages
 * No navbar, read-only content viewing
 */
const PublicLayout = ({ children }) => {
  return (
    <div className="app-shell app-shell--public">
      <main className="app-shell__main">
        <PageContainer>
          {children}
        </PageContainer>
      </main>
    </div>
  );
};

export default PublicLayout;
