import React from 'react';
import './Header.css';

const Header = ({ 
  user, 
  onLogout, 
  connectionStatus, 
  onToggleActivityLog, 
  showActivityLog 
}) => {
  const getInitials = (username) => {
    return username
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">
            <span className="title-icon">📋</span>
            Collaborative Todo Board
          </h1>
        </div>
        
        <div className="header-right">
          <div className="connection-status">
            <div className={`status-indicator ${connectionStatus ? 'connected' : 'disconnected'}`}>
              <div className="status-dot"></div>
              <span className="status-text">
                {connectionStatus ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <button 
            className="toggle-activity-btn"
            onClick={onToggleActivityLog}
            title={showActivityLog ? 'Hide Activity Log' : 'Show Activity Log'}
          >
            {showActivityLog ? '📊' : '📈'}
          </button>
          
          <div className="user-menu">
            <div className="user-info">
              <div className="user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} />
                ) : (
                  <span>{getInitials(user.username)}</span>
                )}
              </div>
              <div className="user-details">
                <span className="username">{user.username}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </div>
            
            <button className="logout-btn" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 