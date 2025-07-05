import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import KanbanBoard from './KanbanBoard';
import ActivityLog from './ActivityLog';
import Header from './Header';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const [showActivityLog, setShowActivityLog] = useState(true);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="dashboard">
      <Header 
        user={user} 
        onLogout={handleLogout}
        connectionStatus={connected}
        onToggleActivityLog={() => setShowActivityLog(!showActivityLog)}
        showActivityLog={showActivityLog}
      />
      
      <div className="dashboard-content">
        <div className={`main-content ${showActivityLog ? 'with-sidebar' : ''}`}>
          <KanbanBoard />
        </div>
        
        {showActivityLog && (
          <div className="sidebar">
            <ActivityLog />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 