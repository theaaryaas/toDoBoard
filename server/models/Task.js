const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  status: {
    type: String,
    enum: ['Todo', 'In Progress', 'Done'],
    default: 'Todo'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dueDate: {
    type: Date,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
  // For conflict detection
  version: {
    type: Number,
    default: 1
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedAt: {
    type: Date,
    default: Date.now
  },
  // For optimistic locking
  optimisticLock: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
taskSchema.index({ status: 1, assignedTo: 1 });
taskSchema.index({ title: 1 }, { unique: true });

// Pre-save middleware to handle versioning and conflict detection
taskSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.version += 1;
    this.lastModifiedAt = new Date();
  }
  next();
});

// Static method to get tasks by status
taskSchema.statics.getTasksByStatus = function(status) {
  return this.find({ status }).populate('assignedTo', 'username avatar').populate('createdBy', 'username');
};

// Static method to get tasks assigned to a user
taskSchema.statics.getTasksByUser = function(userId) {
  return this.find({ assignedTo: userId }).populate('assignedTo', 'username avatar').populate('createdBy', 'username');
};

// Static method to get task count by user and status
taskSchema.statics.getTaskCountByUserAndStatus = function(userId, status) {
  return this.countDocuments({ assignedTo: userId, status });
};

// Static method to find user with fewest active tasks
taskSchema.statics.findUserWithFewestTasks = async function() {
  const User = mongoose.model('User');
  const users = await User.find();
  
  let userWithFewestTasks = null;
  let minTaskCount = Infinity;
  
  for (const user of users) {
    const activeTaskCount = await this.countDocuments({
      assignedTo: user._id,
      status: { $in: ['Todo', 'In Progress'] }
    });
    
    if (activeTaskCount < minTaskCount) {
      minTaskCount = activeTaskCount;
      userWithFewestTasks = user;
    }
  }
  
  return userWithFewestTasks;
};

// Method to check for conflicts
taskSchema.methods.checkForConflicts = async function() {
  const currentTask = await this.constructor.findById(this._id);
  if (!currentTask) return null;
  
  if (currentTask.version !== this.version) {
    return {
      conflict: true,
      serverVersion: currentTask,
      clientVersion: this
    };
  }
  
  return { conflict: false };
};

module.exports = mongoose.model('Task', taskSchema); 