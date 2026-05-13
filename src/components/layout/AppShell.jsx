import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import PageContainer from './PageContainer';
import Home from '../../pages/Home';
import Admin from '../../pages/Admin';

const AppShell = () => {
  return (
    <Router>
      <div className="app-shell">
        <Navbar />
        <main className="app-shell__main">
          <PageContainer>
            <Routes>
              <Route path="/admin" element={<Admin />} />
              <Route path="/" element={<Home />} />
            </Routes>
          </PageContainer>
        </main>
      </div>
    </Router>
  );
};

export default AppShell;
