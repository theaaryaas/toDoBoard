const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const actionRoutes = require('./routes/actions');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // allow more requests for development
});
if (process.env.NODE_ENV === 'production') {
  app.use(limiter);
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
  try {
    // Use MongoDB Atlas free cluster for immediate functionality
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://todoboard:todoboard123@cluster0.mongodb.net/todoboard?retryWrites=true&w=majority';
    console.log('Attempting to connect to MongoDB...');
    console.log('MongoDB URI:', mongoURI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ Connected to MongoDB successfully!');
    
    // Test the connection
    const db = mongoose.connection;
    db.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });
    
    db.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    db.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    console.log('\n🔧 Quick Fix: Using local MongoDB fallback...');
    
    try {
      // Fallback to local MongoDB
      await mongoose.connect('mongodb://localhost:27017/todoboard');
      console.log('✅ Connected to local MongoDB successfully!');
    } catch (localError) {
      console.error('❌ Local MongoDB also failed:', localError.message);
      console.log('\n📝 To fix this:');
      console.log('1. Install MongoDB locally, OR');
      console.log('2. Create MongoDB Atlas account at https://cloud.mongodb.com');
      console.log('3. Update MONGODB_URI in server/.env file');
      console.log('4. Restart the server');
      
      // Don't exit, let the app continue with limited functionality
      console.log('\n⚠️ App will continue without database connection');
    }
  }
};

// Connect to database
connectDB();

// Socket.IO connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    connectedUsers.set(socket.id, userId);
    socket.join('board');
    console.log(`User ${userId} joined the board`);
  });

  socket.on('taskCreated', (task) => {
    socket.to('board').emit('taskCreated', task);
  });

  socket.on('taskUpdated', (task) => {
    socket.to('board').emit('taskUpdated', task);
  });

  socket.on('taskDeleted', (taskId) => {
    socket.to('board').emit('taskDeleted', taskId);
  });

  socket.on('taskMoved', (data) => {
    socket.to('board').emit('taskMoved', data);
  });

  socket.on('conflictDetected', (data) => {
    socket.to('board').emit('conflictDetected', data);
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(socket.id);
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', authenticateToken, taskRoutes);
app.use('/api/actions', authenticateToken, actionRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test endpoint to check database connection
app.get('/api/test', async (req, res) => {
  try {
    const userCount = await mongoose.model('User').countDocuments();
    const taskCount = await mongoose.model('Task').countDocuments();
    res.json({ 
      status: 'OK', 
      message: 'Database connection working',
      userCount,
      taskCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Database test failed', message: error.message });
  }
});

// Test authentication endpoint
app.get('/api/test-auth', authenticateToken, (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Authentication working',
    user: {
      id: req.user._id,
      username: req.user.username
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 