const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'MOVE', 'ASSIGN', 'SMART_ASSIGN', 'CONFLICT_RESOLVED']
  },
  entityType: {
    type: String,
    required: true,
    enum: ['TASK', 'USER']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // For conflict resolution
  conflictData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  // IP address for audit trail
  ipAddress: {
    type: String,
    default: ''
  },
  // User agent for audit trail
  userAgent: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
actionSchema.index({ createdAt: -1 });
actionSchema.index({ user: 1, createdAt: -1 });
actionSchema.index({ action: 1, createdAt: -1 });

// Static method to get recent actions
actionSchema.statics.getRecentActions = function(limit = 20) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'username avatar')
    .lean();
};

// Static method to get actions by user
actionSchema.statics.getActionsByUser = function(userId, limit = 50) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'username avatar')
    .lean();
};

// Static method to get actions by entity
actionSchema.statics.getActionsByEntity = function(entityType, entityId, limit = 50) {
  return this.find({ entityType, entityId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'username avatar')
    .lean();
};

// Method to format action description
actionSchema.methods.getActionDescription = function() {
  const actionMap = {
    'CREATE': 'created',
    'UPDATE': 'updated',
    'DELETE': 'deleted',
    'MOVE': 'moved',
    'ASSIGN': 'assigned',
    'SMART_ASSIGN': 'smart assigned',
    'CONFLICT_RESOLVED': 'resolved conflict for'
  };

  const entityMap = {
    'TASK': 'task',
    'USER': 'user'
  };

  const action = actionMap[this.action] || this.action.toLowerCase();
  const entity = entityMap[this.entityType] || this.entityType.toLowerCase();

  return `${action} ${entity}`;
};

// Pre-save middleware to add user agent and IP if available
actionSchema.pre('save', function(next) {
  if (this.isNew && this.details && this.details.ipAddress) {
    this.ipAddress = this.details.ipAddress;
  }
  if (this.isNew && this.details && this.details.userAgent) {
    this.userAgent = this.details.userAgent;
  }
  next();
});

module.exports = mongoose.model('Action', actionSchema); 