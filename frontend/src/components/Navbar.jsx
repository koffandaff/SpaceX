import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  return (
    <nav>
      <div className="brand">
        <span className="brand-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#88ffff" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </span>
        SPACEEX
      </div>
      
      <div className="nav-links">
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>HOME</Link>
        
        {/* Always show PREDICT link */}
        <Link to="/predict" className={location.pathname === '/predict' ? 'active' : ''}>PREDICT</Link>
        
        {currentUser ? (
          <>
            {currentUser.role === 'admin' && (
              <Link to="/admin" className={location.pathname === '/admin' ? 'active' : ''}>ADMIN</Link>
            )}
            {currentUser.role === 'scientist' && (
              <Link to="/scientist" className={location.pathname === '/scientist' ? 'active' : ''}>SCIENTIST</Link>
            )}
            <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>LOGOUT</a>
            <span style={{color: '#88ffff', fontSize: '0.8rem'}}>
              ({currentUser.role})
            </span>
          </>
        ) : (
          <Link to="/auth" className={location.pathname === '/auth' ? 'active' : ''}>LOGIN/SIGNUP</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;