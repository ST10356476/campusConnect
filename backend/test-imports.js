// test-imports.js for logging correct routes paths
try {
  // Testing database import
  const connectDB = require('./src/config/database');
  // Database import: OK
  
  // Testing User model import
  const User = require('./src/models/User');
  // User model import: OK
  
  // Testing generateToken import
  const generateToken = require('./src/utils/generateToken');
  // GenerateToken import: OK
  
  // Testing auth middleware import
  const { protect } = require('./src/middleware/auth');
  // Auth middleware import: OK
  
  // Testing auth controller import
  const authController = require('./src/controllers/authController');
  // Auth controller import: OK
  
  // Testing auth routes import
  const authRoutes = require('./routes/auth');  
  // Auth routes import: OK
  
  // All imports successful
} catch (error) {
  console.error('Import failed:', error.message);
  console.error('Stack:', error.stack);
}