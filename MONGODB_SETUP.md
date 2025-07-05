# MongoDB Setup Guide

## Option 1: Local MongoDB Installation

### Windows:
1. **Download MongoDB Community Server:**
   - Go to https://www.mongodb.com/try/download/community
   - Download the Windows installer
   - Run the installer and follow the setup wizard

2. **Start MongoDB Service:**
   ```powershell
   # Open PowerShell as Administrator
   net start MongoDB
   ```

3. **Or start manually:**
   ```powershell
   # Navigate to MongoDB bin directory (usually C:\Program Files\MongoDB\Server\6.0\bin)
   mongod
   ```

### macOS:
1. **Install using Homebrew:**
   ```bash
   brew tap mongodb/brew
   brew install mongodb-community
   ```

2. **Start MongoDB:**
   ```bash
   brew services start mongodb-community
   ```

### Linux (Ubuntu/Debian):
1. **Install MongoDB:**
   ```bash
   sudo apt update
   sudo apt install mongodb
   ```

2. **Start MongoDB:**
   ```bash
   sudo systemctl start mongodb
   sudo systemctl enable mongodb
   ```

## Option 2: MongoDB Atlas (Cloud - Recommended)

1. **Create MongoDB Atlas Account:**
   - Go to https://cloud.mongodb.com
   - Sign up for a free account

2. **Create a Cluster:**
   - Click "Build a Database"
   - Choose "FREE" tier
   - Select your preferred cloud provider and region
   - Click "Create"

3. **Set Up Database Access:**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Create a username and password
   - Select "Read and write to any database"
   - Click "Add User"

4. **Set Up Network Access:**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"

5. **Get Connection String:**
   - Go to "Database"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

6. **Create .env file:**
   ```bash
   # In the server directory
   cp env.example .env
   ```

7. **Update .env file:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todoboard
   JWT_SECRET=your-super-secret-jwt-key
   CLIENT_URL=http://localhost:3000
   PORT=5000
   ```

## Option 3: Docker (Alternative)

1. **Install Docker Desktop**

2. **Run MongoDB with Docker:**
   ```bash
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

3. **Create .env file:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/todoboard
   JWT_SECRET=your-super-secret-jwt-key
   CLIENT_URL=http://localhost:3000
   PORT=5000
   ```

## Testing the Connection

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Check for success message:**
   ```
   ✅ Connected to MongoDB successfully!
   ```

3. **If you see errors, check:**
   - MongoDB is running
   - Connection string is correct
   - Network access is configured (for Atlas)
   - Firewall settings

## Common Issues and Solutions

### "ECONNREFUSED" Error:
- MongoDB is not running
- Wrong port (default is 27017)
- Firewall blocking connection

### "Authentication Failed" Error:
- Wrong username/password
- User doesn't have proper permissions
- Database name is incorrect

### "Network Timeout" Error:
- Internet connection issues
- MongoDB Atlas IP whitelist
- Firewall settings

## Quick Fix for Development

If you want to get started quickly, use MongoDB Atlas:

1. Create free account at https://cloud.mongodb.com
2. Create a cluster
3. Get your connection string
4. Create `.env` file in server directory with:
   ```env
   MONGODB_URI=your_atlas_connection_string
   JWT_SECRET=any-random-string
   CLIENT_URL=http://localhost:3000
   PORT=5000
   ```
5. Restart your server

This will resolve the MongoDB connection issue immediately! 