import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import axios from 'axios';
import { useSocket } from '../contexts/SocketContext';
import './ActivityLog.css';

const ActivityLog = () => {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { on, off } = useSocket();

  useEffect(() => {
    fetchActions();

    // Handler function
    const handleUpdate = () => fetchActions();

    // Register listeners
    on('taskCreated', handleUpdate);
    on('taskUpdated', handleUpdate);
    on('taskDeleted', handleUpdate);
    on('taskMoved', handleUpdate);

    // Cleanup listeners on unmount
    return () => {
      off('taskCreated', handleUpdate);
      off('taskUpdated', handleUpdate);
      off('taskDeleted', handleUpdate);
      off('taskMoved', handleUpdate);
    };
    // Only run once on mount/unmount
    // eslint-disable-next-line
  }, []);

  const fetchActions = async () => {
    try {
      const response = await axios.get('/api/actions/recent?limit=20');
      setActions(response.data.actions);
    } catch (error) {
      console.error('Error fetching actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'CREATE':
        return '➕';
      case 'UPDATE':
        return '✏️';
      case 'DELETE':
        return '🗑️';
      case 'MOVE':
        return '📤';
      case 'ASSIGN':
        return '👤';
      case 'SMART_ASSIGN':
        return '🎯';
      case 'CONFLICT_RESOLVED':
        return '⚡';
      default:
        return '📝';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE':
        return 'var(--success-color)';
      case 'UPDATE':
        return 'var(--info-color)';
      case 'DELETE':
        return 'var(--danger-color)';
      case 'MOVE':
        return 'var(--warning-color)';
      case 'ASSIGN':
        return 'var(--primary-color)';
      case 'SMART_ASSIGN':
        return 'var(--secondary-color)';
      case 'CONFLICT_RESOLVED':
        return 'var(--danger-color)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const formatActionDescription = (action) => {
    const { action: actionType, details, user } = action;
    
    switch (actionType) {
      case 'CREATE':
        return `${user.username} created task "${details.taskTitle}"`;
      case 'UPDATE':
        return `${user.username} updated task "${details.taskTitle}"`;
      case 'DELETE':
        return `${user.username} deleted task "${details.taskTitle}"`;
      case 'MOVE':
        return `${user.username} moved task "${details.taskTitle}" from ${details.oldStatus} to ${details.newStatus}`;
      case 'ASSIGN':
        return `${user.username} assigned task "${details.taskTitle}"`;
      case 'SMART_ASSIGN':
        return `${user.username} smart assigned task "${details.taskTitle}" to ${details.assignedToUsername}`;
      case 'CONFLICT_RESOLVED':
        return `${user.username} resolved conflict for task "${details.taskTitle}"`;
      default:
        return `${user.username} performed ${actionType.toLowerCase()} action`;
    }
  };

  if (loading) {
    return (
      <div className="activity-log">
        <div className="activity-header">
          <h3>Activity Log</h3>
        </div>
        <div className="activity-loading">
          <div className="loading-spinner"></div>
          <p>Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="activity-log">
      <div className="activity-header">
        <h3>Recent Activities</h3>
        <button onClick={fetchActions} className="refresh-btn">
          🔄
        </button>
      </div>
      
      <div className="activity-list">
        {actions.length === 0 ? (
          <div className="no-activities">
            <p>No activities yet</p>
          </div>
        ) : (
          actions.map((action) => (
            <div key={action.id} className="activity-item">
              <div className="activity-icon" style={{ color: getActionColor(action.action) }}>
                {getActionIcon(action.action)}
              </div>
              
              <div className="activity-content">
                <p className="activity-description">
                  {formatActionDescription(action)}
                </p>
                <span className="activity-time">
                  {format(new Date(action.createdAt), 'MMM dd, HH:mm')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityLog; 