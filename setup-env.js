const fs = require('fs');
const path = require('path');

const envContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/todoboard

# For MongoDB Atlas (uncomment and replace with your connection string):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todoboard

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
`;

const envPath = path.join(__dirname, 'server', '.env');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully in server directory!');
  console.log('\n📝 Next steps:');
  console.log('1. Edit server/.env file with your MongoDB connection string');
  console.log('2. For MongoDB Atlas: Replace MONGODB_URI with your connection string');
  console.log('3. For local MongoDB: Make sure MongoDB is running');
  console.log('4. Restart your server with: npm run dev');
} catch (error) {
  console.error('❌ Error creating .env file:', error.message);
  console.log('\n📝 Manual setup:');
  console.log('1. Create a file named .env in the server directory');
  console.log('2. Copy the content from env.example');
  console.log('3. Update MONGODB_URI with your connection string');
} 