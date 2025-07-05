import React, { useState } from 'react';
import { format } from 'date-fns';
import api from '../config/axios';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import toast from 'react-hot-toast';
import './TaskCard.css';

const TaskCard = ({ task, index, users, onUpdate, onSmartAssign, onMoveTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    assignedTo: task.assignedTo?._id || ''
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low':
        return 'var(--success-color)';
      case 'Medium':
        return 'var(--warning-color)';
      case 'High':
        return 'var(--danger-color)';
      case 'Critical':
        return 'var(--danger-color)';
      default:
        return 'var(--text-muted)';
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const response = await api.put(`/tasks/${task._id}`, {
        ...editData,
        version: task.version
      });
      
      onUpdate(task._id, response.data.task);
      setIsEditing(false);
      toast.success('Task updated successfully!');
    } catch (error) {
      console.error('Error updating task:', error);
      if (error.response?.data?.conflict) {
        // Handle conflict - this will be handled by the conflict resolution modal
        return;
      }
      toast.error('Failed to update task');
    }
  };

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignedTo: task.assignedTo?._id || ''
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await api.delete(`/tasks/${task._id}`);
      onUpdate(task._id, null); // Signal deletion
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleSmartAssign = () => {
    onSmartAssign(task._id);
  };

  const handleMoveTask = (newStatus) => {
    console.log('Move task:', task._id, 'to', newStatus);
    onMoveTask(task._id, newStatus);
    setShowMoveMenu(false);
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const isDueToday = task.dueDate && format(new Date(task.dueDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const availableStatuses = ['Todo', 'In Progress', 'Done'].filter(status => status !== task.status);

  return (
    <div className="task-card">
      {isEditing ? (
        <div className="task-edit-form">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="edit-input"
            placeholder="Task title"
          />
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            className="edit-textarea"
            placeholder="Task description"
            rows="3"
          />
          <select
            value={editData.priority}
            onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
            className="edit-select"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
          <select
            value={editData.assignedTo}
            onChange={(e) => setEditData({ ...editData, assignedTo: e.target.value })}
            className="edit-select"
          >
            <option value="">Unassigned</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.username}
              </option>
            ))}
          </select>
          <div className="edit-actions">
            <button onClick={handleSave} className="save-btn">Save</button>
            <button onClick={handleCancel} className="cancel-btn">Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <div className="task-header">
            <h4 className="task-title">{task.title}</h4>
            <div className="task-actions">
              <button onClick={handleEdit} className="action-btn" title="Edit">✏️</button>
              <button onClick={handleDelete} className="action-btn" title="Delete">🗑️</button>
            </div>
          </div>
          
          <p className="task-description">{task.description}</p>
          
          <div className="task-meta">
            <span 
              className="priority-badge"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
            >
              {task.priority}
            </span>
            
            {task.dueDate && (
              <span className={`due-date ${isOverdue ? 'overdue' : ''} ${isDueToday ? 'due-today' : ''}`}>
                📅 {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                {isOverdue && ' (Overdue)'}
                {isDueToday && ' (Due Today)'}
              </span>
            )}
            
            <span className="task-status">{task.status}</span>
          </div>
          
          {task.assignedTo && (
            <div className="task-assignee">
              <div className="assignee-info">
                <div className="user-avatar">
                  {task.assignedTo.avatar ? (
                    <img src={task.assignedTo.avatar} alt={task.assignedTo.username} />
                  ) : (
                    <span>{task.assignedTo.username.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="assignee-name">{task.assignedTo.username}</span>
              </div>
            </div>
          )}
          
          {!task.assignedTo && (
            <div className="task-actions-bottom">
              <button 
                onClick={handleSmartAssign}
                className="smart-assign-btn"
                title="Smart Assign"
              >
                🎯 Smart Assign
              </button>
            </div>
          )}
          
          {task.tags && task.tags.length > 0 && (
            <div className="task-tags">
              {task.tags.map((tag, index) => (
                <span key={index} className="task-tag">{tag}</span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskCard; 