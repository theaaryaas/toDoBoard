# MongoDB Atlas Setup (Required for Deployment)

This guide is specifically for setting up MongoDB Atlas for your Render + Vercel deployment.

## Quick Setup (5 minutes)

### 1. Create MongoDB Atlas Account
- Go to https://cloud.mongodb.com
- Sign up for a free account

### 2. Create a Cluster
- Click "Build a Database"
- Choose "FREE" tier (M0)
- Select your preferred cloud provider and region
- Click "Create"

### 3. Set Up Database Access
- Go to "Database Access" in the left sidebar
- Click "Add New Database User"
- Create a username and password (save these!)
- Select "Read and write to any database"
- Click "Add User"

### 4. Set Up Network Access
- Go to "Network Access" in the left sidebar
- Click "Add IP Address"
- Click "Allow Access from Anywhere" (for development)
- Click "Confirm"

### 5. Get Your Connection String
- Go to "Database" in the left sidebar
- Click "Connect"
- Choose "Connect your application"
- Copy the connection string

### 6. Update Your Environment Variables

**For Local Development:**
Create `.env` file in the `server` directory:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todoboard
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLIENT_URL=http://localhost:3000
PORT=5000
```

**For Render Deployment:**
Add these environment variables in your Render dashboard:
- `MONGODB_URI` = your_atlas_connection_string
- `JWT_SECRET` = your-secret-key
- `CLIENT_URL` = your-vercel-frontend-url

## Testing the Connection

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Look for success message:**
   ```
   ✅ Connected to MongoDB successfully!
   ```

## Common Issues

### "Authentication Failed"
- Check username/password in connection string
- Ensure user has "Read and write to any database" permissions

### "Network Timeout"
- Verify "Allow Access from Anywhere" is enabled in Network Access
- Check your internet connection

### "Invalid Connection String"
- Make sure to replace `<password>` with your actual password
- Ensure the database name is correct (e.g., `/todoboard`)

## Quick Fix

If you're having issues, double-check:
1. ✅ MongoDB Atlas cluster is created
2. ✅ Database user exists with proper permissions
3. ✅ Network access allows connections from anywhere
4. ✅ Connection string is copied correctly
5. ✅ Environment variables are set in Render

That's it! Your MongoDB Atlas setup is complete for deployment. 🚀 