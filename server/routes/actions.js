const express = require('express');
const Action = require('../models/Action');

const router = express.Router();

// Get recent actions (last 20 by default)
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const actions = await Action.getRecentActions(limit);
    
    // Format actions for frontend
    const formattedActions = actions.map(action => ({
      id: action._id,
      user: action.user,
      action: action.action,
      entityType: action.entityType,
      entityId: action.entityId,
      details: action.details,
      createdAt: action.createdAt,
      description: action.getActionDescription ? action.getActionDescription() : `${action.action.toLowerCase()} ${action.entityType.toLowerCase()}`
    }));

    res.json({ actions: formattedActions });
  } catch (error) {
    console.error('Get recent actions error:', error);
    res.status(500).json({ error: 'Failed to get recent actions' });
  }
});

// Get actions by user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const actions = await Action.getActionsByUser(userId, limit);
    
    const formattedActions = actions.map(action => ({
      id: action._id,
      user: action.user,
      action: action.action,
      entityType: action.entityType,
      entityId: action.entityId,
      details: action.details,
      createdAt: action.createdAt,
      description: action.getActionDescription ? action.getActionDescription() : `${action.action.toLowerCase()} ${action.entityType.toLowerCase()}`
    }));

    res.json({ actions: formattedActions });
  } catch (error) {
    console.error('Get user actions error:', error);
    res.status(500).json({ error: 'Failed to get user actions' });
  }
});

// Get actions by entity (task or user)
router.get('/entity/:entityType/:entityId', async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const actions = await Action.getActionsByEntity(entityType, entityId, limit);
    
    const formattedActions = actions.map(action => ({
      id: action._id,
      user: action.user,
      action: action.action,
      entityType: action.entityType,
      entityId: action.entityId,
      details: action.details,
      createdAt: action.createdAt,
      description: action.getActionDescription ? action.getActionDescription() : `${action.action.toLowerCase()} ${action.entityType.toLowerCase()}`
    }));

    res.json({ actions: formattedActions });
  } catch (error) {
    console.error('Get entity actions error:', error);
    res.status(500).json({ error: 'Failed to get entity actions' });
  }
});

// Get action statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      total: await Action.countDocuments(),
      today: await Action.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }),
      thisWeek: await Action.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setDate(new Date().getDate() - 7))
        }
      }),
      byAction: {
        CREATE: await Action.countDocuments({ action: 'CREATE' }),
        UPDATE: await Action.countDocuments({ action: 'UPDATE' }),
        DELETE: await Action.countDocuments({ action: 'DELETE' }),
        MOVE: await Action.countDocuments({ action: 'MOVE' }),
        ASSIGN: await Action.countDocuments({ action: 'ASSIGN' }),
        SMART_ASSIGN: await Action.countDocuments({ action: 'SMART_ASSIGN' }),
        CONFLICT_RESOLVED: await Action.countDocuments({ action: 'CONFLICT_RESOLVED' })
      }
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get action stats error:', error);
    res.status(500).json({ error: 'Failed to get action statistics' });
  }
});

module.exports = router; 