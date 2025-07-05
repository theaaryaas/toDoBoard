const express = require('express');
const { body, validationResult } = require('express-validator');
const Task = require('../models/Task');
const Action = require('../models/Action');
const User = require('../models/User');

const router = express.Router();

// Validation middleware
const validateTask = [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters')
    .custom(async (value) => {
      // Check if title matches column names
      const columnNames = ['Todo', 'In Progress', 'Done'];
      if (columnNames.includes(value)) {
        throw new Error('Task title cannot match column names');
      }
      return true;
    }),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('status')
    .optional()
    .isIn(['Todo', 'In Progress', 'Done'])
    .withMessage('Invalid status'),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High', 'Critical'])
    .withMessage('Invalid priority')
];

// Helper function to log actions
const logAction = async (user, action, entityType, entityId, details = {}, req = null) => {
  try {
    await Action.create({
      user: user._id,
      action,
      entityType,
      entityId,
      details: {
        ...details,
        ipAddress: req?.ip,
        userAgent: req?.get('User-Agent')
      }
    });
  } catch (error) {
    console.error('Error logging action:', error);
  }
};

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('assignedTo', 'username avatar')
      .populate('createdBy', 'username')
      .populate('lastModifiedBy', 'username')
      .sort({ createdAt: -1 });

    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

// Get tasks by status
router.get('/status/:status', async (req, res) => {
  try {
    const { status } = req.params;
    const tasks = await Task.getTasksByStatus(status);
    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks by status error:', error);
    res.status(500).json({ error: 'Failed to get tasks' });
  }
});

// Create new task
router.post('/', validateTask, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, status, priority, assignedTo, dueDate, tags } = req.body;

    // Check for duplicate title
    const existingTask = await Task.findOne({ title });
    if (existingTask) {
      return res.status(400).json({ error: 'Task title must be unique' });
    }

    const task = new Task({
      title,
      description: description || '',
      status: status || 'Todo',
      priority: priority || 'Medium',
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      lastModifiedBy: req.user._id,
      dueDate: dueDate || null,
      tags: tags || []
    });

    await task.save();
    await task.populate('assignedTo', 'username avatar');
    await task.populate('createdBy', 'username');

    // Log action
    await logAction(req.user, 'CREATE', 'TASK', task._id, {
      taskTitle: task.title,
      status: task.status
    }, req);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('taskCreated', task);

    res.status(201).json({ task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Update task
router.put('/:id', validateTask, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, status, priority, assignedTo, dueDate, tags, version } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Conflict detection
    if (version && task.version !== version) {
      const conflictData = {
        serverVersion: task,
        clientVersion: req.body,
        taskId: id
      };

      // Emit conflict to all clients
      const io = req.app.get('io');
      io.emit('conflictDetected', conflictData);

      return res.status(409).json({
        error: 'Conflict detected',
        conflict: true,
        serverVersion: task,
        clientVersion: req.body
      });
    }

    // Check for duplicate title (excluding current task)
    if (title && title !== task.title) {
      const existingTask = await Task.findOne({ title, _id: { $ne: id } });
      if (existingTask) {
        return res.status(400).json({ error: 'Task title must be unique' });
      }
    }

    // Update task
    const updateData = {
      title: title || task.title,
      description: description !== undefined ? description : task.description,
      status: status || task.status,
      priority: priority || task.priority,
      assignedTo: assignedTo !== undefined ? assignedTo : task.assignedTo,
      dueDate: dueDate !== undefined ? dueDate : task.dueDate,
      tags: tags || task.tags,
      lastModifiedBy: req.user._id
    };

    Object.assign(task, updateData);
    await task.save();
    await task.populate('assignedTo', 'username avatar');
    await task.populate('createdBy', 'username');
    await task.populate('lastModifiedBy', 'username');

    // Log action
    await logAction(req.user, 'UPDATE', 'TASK', task._id, {
      taskTitle: task.title,
      status: task.status,
      changes: req.body
    }, req);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('taskUpdated', task);

    res.json({ task });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await Task.findByIdAndDelete(id);

    // Log action
    await logAction(req.user, 'DELETE', 'TASK', id, {
      taskTitle: task.title
    }, req);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('taskDeleted', id);

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Move task (drag and drop)
router.patch('/:id/move', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;
    
    console.log('Move task request:', { id, status, assignedTo, user: req.user._id });

    const task = await Task.findById(id);
    if (!task) {
      console.log('Task not found:', id);
      return res.status(404).json({ error: 'Task not found' });
    }

    const oldStatus = task.status;
    const oldAssignedTo = task.assignedTo;

    console.log('Moving task from', oldStatus, 'to', status);

    task.status = status || task.status;
    task.assignedTo = assignedTo !== undefined ? assignedTo : task.assignedTo;
    task.lastModifiedBy = req.user._id;

    await task.save();
    await task.populate('assignedTo', 'username avatar');
    await task.populate('createdBy', 'username');

    console.log('Task moved successfully:', { taskId: task._id, oldStatus, newStatus: task.status });

    // Log action
    await logAction(req.user, 'MOVE', 'TASK', task._id, {
      taskTitle: task.title,
      oldStatus,
      newStatus: task.status,
      oldAssignedTo,
      newAssignedTo: task.assignedTo
    }, req);

    // Emit real-time update
    const io = req.app.get('io');
    const moveData = {
      taskId: task._id,
      task,
      oldStatus,
      newStatus: task.status
    };
    console.log('Emitting taskMoved event:', moveData);
    io.emit('taskMoved', moveData);

    res.json({ task });
  } catch (error) {
    console.error('Move task error:', error);
    res.status(500).json({ error: 'Failed to move task' });
  }
});

// Smart assign task
router.post('/:id/smart-assign', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Find user with fewest active tasks
    const userWithFewestTasks = await Task.findUserWithFewestTasks();
    
    if (!userWithFewestTasks) {
      return res.status(404).json({ error: 'No users available for assignment' });
    }

    const oldAssignedTo = task.assignedTo;
    task.assignedTo = userWithFewestTasks._id;
    task.lastModifiedBy = req.user._id;

    await task.save();
    await task.populate('assignedTo', 'username avatar');
    await task.populate('createdBy', 'username');

    // Log action
    await logAction(req.user, 'SMART_ASSIGN', 'TASK', task._id, {
      taskTitle: task.title,
      oldAssignedTo,
      newAssignedTo: userWithFewestTasks._id,
      assignedToUsername: userWithFewestTasks.username
    }, req);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('taskUpdated', task);

    res.json({ 
      task,
      message: `Task smart assigned to ${userWithFewestTasks.username}`
    });
  } catch (error) {
    console.error('Smart assign error:', error);
    res.status(500).json({ error: 'Failed to smart assign task' });
  }
});

// Resolve conflict
router.post('/:id/resolve-conflict', async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, chosenVersion } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    if (resolution === 'merge') {
      // Merge logic - combine both versions
      const mergedData = {
        ...chosenVersion,
        version: task.version + 1,
        lastModifiedBy: req.user._id
      };
      Object.assign(task, mergedData);
    } else if (resolution === 'overwrite') {
      // Overwrite with chosen version
      Object.assign(task, chosenVersion);
      task.lastModifiedBy = req.user._id;
    }

    await task.save();
    await task.populate('assignedTo', 'username avatar');
    await task.populate('createdBy', 'username');

    // Log action
    await logAction(req.user, 'CONFLICT_RESOLVED', 'TASK', task._id, {
      taskTitle: task.title,
      resolution,
      chosenVersion
    }, req);

    // Emit real-time update
    const io = req.app.get('io');
    io.emit('taskUpdated', task);

    res.json({ task });
  } catch (error) {
    console.error('Resolve conflict error:', error);
    res.status(500).json({ error: 'Failed to resolve conflict' });
  }
});

// Get task statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      total: await Task.countDocuments(),
      todo: await Task.countDocuments({ status: 'Todo' }),
      inProgress: await Task.countDocuments({ status: 'In Progress' }),
      done: await Task.countDocuments({ status: 'Done' }),
      unassigned: await Task.countDocuments({ assignedTo: null })
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

module.exports = router; 