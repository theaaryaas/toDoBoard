import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import KanbanColumn from './KanbanColumn';
import CreateTaskModal from './CreateTaskModal';
import ConflictResolutionModal from './ConflictResolutionModal';
import api from '../config/axios';
import toast from 'react-hot-toast';
import './KanbanBoard.css';
import TaskCard from './TaskCard';

const COLUMN_STATUSES = ['Todo', 'In Progress', 'Done'];

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [stats, setStats] = useState({});
  const [lastCreatedTaskId, setLastCreatedTaskId] = useState(null);
  
  const { on } = useSocket();

  // Memoize filtered task arrays
  const todoTasks = useMemo(() => tasks.filter(task => task.status === 'Todo'), [tasks]);
  const inProgressTasks = useMemo(() => tasks.filter(task => task.status === 'In Progress'), [tasks]);
  const doneTasks = useMemo(() => tasks.filter(task => task.status === 'Done'), [tasks]);

  // Fetch initial data
  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchStats();
  }, []);

  // Socket event listeners
  useEffect(() => {
    const handleTaskCreated = (newTask) => {
      console.log('Socket: Task created', newTask);
      
      // Check if this is a duplicate notification for the same task
      if (lastCreatedTaskId === newTask._id) {
        console.log('Duplicate notification for task, ignoring');
        return;
      }
      
      setTasks(prev => {
        // Check if task already exists by ID
        const existsById = prev.some(task => String(task._id) === String(newTask._id));
        if (existsById) {
          console.log('Task already exists by ID, ignoring socket event');
          return prev;
        }
        
        // Also check by title as a fallback (in case IDs don't match)
        const existsByTitle = prev.some(task => task.title === newTask.title);
        if (existsByTitle) {
          console.log('Task already exists by title, ignoring socket event');
          return prev;
        }
        
        console.log('Adding new task from socket event');
        return [...prev, newTask];
      });
      
      // Set the last created task ID to prevent duplicate notifications
      setLastCreatedTaskId(newTask._id);
      
      // Clear the flag after a short delay
      setTimeout(() => {
        setLastCreatedTaskId(null);
      }, 2000);
      
      toast.success('Task created successfully!');
    };

    const handleTaskUpdated = (updatedTask) => {
      console.log('Socket: Task updated', updatedTask);
      setTasks(prev => prev.map(task => 
        String(task._id) === String(updatedTask._id) ? updatedTask : task
      ));
      toast.success('Task updated!');
    };

    const handleTaskDeleted = (taskId) => {
      console.log('Socket: Task deleted', taskId);
      setTasks(prev => prev.filter(task => String(task._id) !== String(taskId)));
      toast.success('Task deleted!');
    };

    const handleTaskMoved = (data) => {
      console.log('Socket: Task moved', data);
      setTasks(prev => prev.map(task => 
        String(task._id) === String(data.taskId) ? data.task : task
      ));
      toast.success('Task moved!');
    };

    const handleConflictDetected = (data) => {
      console.log('Socket: Conflict detected', data);
      setConflictData(data);
    };

    on('taskCreated', handleTaskCreated);
    on('taskUpdated', handleTaskUpdated);
    on('taskDeleted', handleTaskDeleted);
    on('taskMoved', handleTaskMoved);
    on('conflictDetected', handleConflictDetected);

    return () => {
      // Cleanup listeners if needed
    };
  }, [on, lastCreatedTaskId]);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      console.log('Fetched tasks:', response.data.tasks);
      setTasks(response.data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/tasks/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Task update handler
  const handleTaskUpdate = useCallback((taskId, updates) => {
    if (updates === null) {
      // Task was deleted
      setTasks(prev => prev.filter(task => task._id !== taskId));
    } else {
      // Task was updated
      setTasks(prev => prev.map(task => 
        task._id === taskId ? updates : task
      ));
    }
  }, []);

  // Smart assign handler
  const handleSmartAssign = useCallback(async (taskId) => {
    try {
      const response = await api.post(`/tasks/${taskId}/smart-assign`);
      setTasks(prev => prev.map(task => 
        task._id === taskId ? response.data.task : task
      ));
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error smart assigning task:', error);
      toast.error('Failed to smart assign task');
    }
  }, []);

  // Move task handler
  const handleMoveTask = useCallback(async (taskId, newStatus) => {
    console.log('KanbanBoard: handleMoveTask called with:', { taskId, newStatus });
    try {
      console.log('KanbanBoard: Making API call to move task...');
      const response = await api.patch(`/tasks/${taskId}/move`, {
        status: newStatus
      });
      console.log('KanbanBoard: Move task API response:', response.data);
      setTasks(prev => prev.map(task => 
        task._id === taskId ? response.data.task : task
      ));
      toast.success('Task moved successfully!');
    } catch (error) {
      console.error('KanbanBoard: Error moving task:', error);
      console.error('KanbanBoard: Error response:', error.response?.data);
      toast.error('Failed to move task');
    }
  }, []);

  const handleCreateTask = async (taskData) => {
    try {
      await api.post('/tasks', taskData);
      // Don't update local state here - let the socket event handle it
      setShowCreateModal(false);
      // Don't show success toast here - let the socket event handle it
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleResolveConflict = async (resolution) => {
    try {
      const response = await api.post(`/tasks/${conflictData.taskId}/resolve-conflict`, resolution);
      setTasks(prev => prev.map(task => 
        task._id === conflictData.taskId ? response.data.task : task
      ));
      setConflictData(null);
      toast.success('Conflict resolved successfully!');
    } catch (error) {
      console.error('Error resolving conflict:', error);
      toast.error('Failed to resolve conflict');
    }
  };

  // Helper to get tasks by status
  const getTasksByStatus = (status) => tasks.filter(task => task.status === status);

  if (loading) {
    return (
      <div className="kanban-loading">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="kanban-board">
      <div className="kanban-header">
        <div className="kanban-title">
          <h2>📋 Task Board</h2>
          <div className="task-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.todo || 0}</span>
              <span className="stat-label">Todo</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.inProgress || 0}</span>
              <span className="stat-label">In Progress</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.done || 0}</span>
              <span className="stat-label">Done</span>
            </div>
          </div>
        </div>
        <button 
          className="create-task-btn"
          onClick={() => setShowCreateModal(true)}
        >
          ➕ Create Task
        </button>
      </div>

      {tasks.length > 0 || !loading ? (
        <div className="kanban-columns">
          <KanbanColumn
            title="Todo"
            tasks={todoTasks}
            status="Todo"
            users={users}
            onTaskUpdate={handleTaskUpdate}
            onSmartAssign={handleSmartAssign}
            onMoveTask={handleMoveTask}
            allTasks={tasks}
          />
          
          <KanbanColumn
            title="In Progress"
            tasks={inProgressTasks}
            status="In Progress"
            users={users}
            onTaskUpdate={handleTaskUpdate}
            onSmartAssign={handleSmartAssign}
            onMoveTask={handleMoveTask}
            allTasks={tasks}
          />
          
          <KanbanColumn
            title="Done"
            tasks={doneTasks}
            status="Done"
            users={users}
            onTaskUpdate={handleTaskUpdate}
            onSmartAssign={handleSmartAssign}
            onMoveTask={handleMoveTask}
            allTasks={tasks}
          />
        </div>
      ) : (
        <div className="empty-board">
          <p>No tasks found.</p>
        </div>
      )}

      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTask}
          users={users}
        />
      )}
      {conflictData && (
        <ConflictResolutionModal
          conflictData={conflictData}
          onResolve={handleResolveConflict}
        />
      )}
    </div>
  );
};

export default KanbanBoard; 