import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PublicLayout from './PublicLayout';
import AdminLayout from './AdminLayout';
import Home from '../../pages/Home';
import Admin from '../../pages/Admin';

/**
 * AppShell - Root app component
 * Handles routing and layout selection (Public vs Admin)
 */
const AppShell = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes - no navbar */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />

        {/* Admin routes - with navbar */}
        <Route
          path="/admin/*"
          element={
            <AdminLayout>
              <Admin />
            </AdminLayout>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppShell;
