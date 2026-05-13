import React from 'react';
import Navbar from './Navbar';
import PageContainer from './PageContainer';

/**
 * AdminLayout - Used for admin pages
 * Includes Navbar and admin functionality
 */
const AdminLayout = ({ children }) => {
  return (
    <div className="app-shell app-shell--admin">
      <Navbar />
      <main className="app-shell__main">
        <PageContainer>
          {children}
        </PageContainer>
      </main>
    </div>
  );
};

export default AdminLayout;
