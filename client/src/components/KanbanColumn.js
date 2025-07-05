import React, { useState } from 'react';
import TaskCard from './TaskCard';
import './KanbanColumn.css';

const KanbanColumn = ({ 
  title, 
  tasks = [], 
  status, 
  users = [], 
  onTaskUpdate, 
  onSmartAssign,
  onMoveTask,
  allTasks = []
}) => {
  const [showMoveDropdown, setShowMoveDropdown] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');

  console.log(`KanbanColumn render: ${status}`, {
    taskCount: tasks.length,
    taskIds: tasks.map(t => String(t._id))
  });

  // Tasks from other columns
  const otherTasks = allTasks.filter(task => task.status !== status);

  return (
    <div className="kanban-column">
      <div className="column-header">
        <h3 className="column-title">{title}</h3>
        <span className="task-count">{tasks.length}</span>
        <button className="move-here-btn" onClick={() => setShowMoveDropdown(v => !v)}>
          Move Task Here
        </button>
        {showMoveDropdown && (
          <div className="move-dropdown">
            <select
              value={selectedTaskId}
              onChange={e => setSelectedTaskId(e.target.value)}
            >
              <option value="">Select a task to move...</option>
              {otherTasks.map(task => (
                <option key={task._id} value={task._id}>{task.title} ({task.status})</option>
              ))}
            </select>
            <button
              disabled={!selectedTaskId}
              onClick={() => {
                if (selectedTaskId) {
                  onMoveTask(selectedTaskId, status);
                  setShowMoveDropdown(false);
                  setSelectedTaskId('');
                }
              }}
            >
              Move
            </button>
            <button onClick={() => setShowMoveDropdown(false)}>Cancel</button>
          </div>
        )}
      </div>
      <div className="column-content">
        {tasks && tasks.length > 0 ? (
          tasks.map((task, index) => {
            const taskId = String(task._id);
            console.log(`Rendering task in ${status}:`, { taskId, index, title: task.title });
            return (
              <TaskCard
                key={taskId}
                task={task}
                index={index}
                users={users}
                onUpdate={onTaskUpdate}
                onSmartAssign={onSmartAssign}
                onMoveTask={onMoveTask}
              />
            );
          })
        ) : (
          <div className="empty-column">
            <p>No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
