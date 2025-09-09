// test-imports.js for logging correct routes paths
try {
  console.log('Testing database import...');
  const connectDB = require('./src/config/database');
  console.log('Database import: OK');
  
  console.log('Testing User model import...');
  const User = require('./src/models/User');
  console.log('User model import: OK');
  
  console.log('Testing generateToken import...');
  const generateToken = require('./src/utils/generateToken');
  console.log('GenerateToken import: OK');
  
  console.log('Testing auth middleware import...');
  const { protect } = require('./src/middleware/auth');
  console.log('Auth middleware import: OK');
  
  console.log('Testing auth controller import...');
  const authController = require('./src/controllers/authController');
  console.log('Auth controller import: OK');
  
  console.log('Testing auth routes import...');
  const authRoutes = require('./routes/auth');  
  console.log('Auth routes import: OK');
  
  console.log('All imports successful!');
} catch (error) {
  console.error('Import failed:', error.message);
  console.error('Stack:', error.stack);
}