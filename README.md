# Collaborative Todo Board

A real-time collaborative task management application built with React, Node.js, and Socket.IO.

## 🚀 Features

- **Real-time Collaboration**: Multiple users can work on tasks simultaneously
- **Kanban Board**: Drag-and-drop task management with Todo, In Progress, and Done columns
- **Task Management**: Create, edit, delete, and move tasks between columns
- **User Authentication**: Secure login and registration system
- **Smart Assignment**: Automatically assign tasks to users with the least workload
- **Activity Log**: Track all task-related activities
- **Conflict Resolution**: Handle concurrent edits with conflict detection
- **Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Socket.IO Client** - Real-time communication
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **CSS3** - Styling with gradients and animations

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd todoboard1
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/todoboard
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the application**
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start both the backend (port 5000) and frontend (port 3000).

## 🌐 Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Register a new account or log in with existing credentials
3. Create tasks using the "Create Task" button
4. Move tasks between columns using the "Move Task Here" dropdown
5. Edit tasks by clicking the edit icon
6. View activity logs in the sidebar

## 📁 Project Structure

```
todoboard1/
├── client/                 # React frontend
│   ├── public/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── middleware/         # Express middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── index.js           # Server entry point
├── package.json
└── README.md
```

## 🔧 Configuration

### MongoDB Setup

**Option 1: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/todoboard`

**Option 2: MongoDB Atlas (Recommended)**
1. Create a free account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/todoboard |
| `JWT_SECRET` | JWT signing secret | your-super-secret-jwt-key |
| `CLIENT_URL` | Frontend URL | http://localhost:3000 |

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Set build command: `cd client && npm install && npm run build`
   - Set output directory: `client/build`

3. **Deploy to Netlify**
   - Connect your GitHub repository to Netlify
   - Set build command: `cd client && npm install && npm run build`
   - Set publish directory: `client/build`

### Backend Deployment (Render/Railway/Heroku)

1. **Create a production build**
   ```bash
   cd server
   npm install
   ```

2. **Set environment variables** in your hosting platform:
   - `MONGODB_URI` (your MongoDB Atlas connection string)
   - `JWT_SECRET` (a strong secret key)
   - `CLIENT_URL` (your frontend URL)

3. **Deploy to Render**
   - Connect your GitHub repository
   - Set build command: `cd server && npm install`
   - Set start command: `cd server && npm start`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions, please open an issue on GitHub.

## 🙏 Acknowledgments

- React team for the amazing framework
- Socket.IO for real-time capabilities
- MongoDB for the database solution
- All contributors and users of this project 