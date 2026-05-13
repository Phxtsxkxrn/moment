import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/admin', label: 'Admin' },
];

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar__brand">
        <div className="navbar__logo">💞</div>
        <div>
          <p className="navbar__title">Moment</p>
          <p className="navbar__subtitle">Cherish every memory</p>
        </div>
      </div>

      <nav className="navbar__navigation" aria-label="Primary navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `navbar__link ${isActive ? 'navbar__link--active' : ''}`
            }
            end={item.path === '/'}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default Navbar;
