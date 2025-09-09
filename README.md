# 🎓 Campus Connect

> **A comprehensive student collaboration platform for universities**  
> *Built for hackathon competition - connecting students through study groups, resource sharing, and collaborative learning*


## 🌟 Overview

Campus Connect is a full-stack web application designed to enhance student collaboration at universities. It provides a platform where students can form study groups, share resources, organize meetups, and engage in real-time collaboration sessions.

### ✨ Key Features

- **🏛️ Community System** - Join university-specific communities and study groups
- **📚 Study Materials** - Upload, share, and discover educational resources
- **📅 Meetup Organization** - Create and join study sessions with video conferencing
- **🏆 Achievements System** - Gamified learning with badges and progress tracking
- **💬 Real-time Collaboration** - Live chat, whiteboard, and screen sharing
- **👤 User Profiles** - Comprehensive student profiles with academic information
- **📱 Responsive Design** - Optimized for desktop and mobile devices
- **🤖 AI Content Generation** - Automatically generate study notes, summaries, and quizzes from uploaded materials

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Socket.io Client** for real-time features
- **Axios** for API communication

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time communication
- **Multer** for file uploads
- **Cloudinary** for media management
- **bcryptjs** for password hashing
- **Gemini AI** for Text Generation Model

### Development Tools
- **ESLint** and **Prettier** for code quality
- **Nodemon** for development
- **CORS** for cross-origin requests

## 📁 Project Structure

```
campus-connect/
├── frontend/                     # React TypeScript application
│   ├── public/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── communities/    # Community-related components
│   │   │   ├── dashboard/      # Dashboard components
│   │   │   ├── layouts/        # Layout components
│   │   │   ├── meetings/       # Meetup components
│   │   │   ├── profile/        # User profile components
│   │   │   └── ui/            # Base UI components (buttons, cards, etc.)
│   │   ├── pages/             # Route components
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Communities.tsx
│   │   │   ├── Meetups.tsx
│   │   │   ├── StudyMaterials.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Achievements.tsx
│   │   │   └── LiveSession.tsx
│   │   ├── services/          # API service functions
│   │   │   ├── api.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── communities.service.ts
│   │   │   ├── meetups.service.ts
│   │   │   └── materials.service.ts
│   │   ├── hooks/             # Custom React hooks
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions
│   │   └── styles/           # CSS and styling files
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                     # Node.js Express API
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   │   ├── database.js
│   │   │   ├── cloudinary.js
│   │   │   └── config.js
│   │   ├── models/            # MongoDB schemas
│   │   │   ├── User.js
│   │   │   ├── Community.js
│   │   │   ├── StudyMaterial.js
│   │   │   ├── Meetup.js
│   │   │   ├── Achievement.js
│   │   │   └── LiveSession.js
│   │   ├── routes/            # API route definitions
│   │   │   ├── auth.js
│   │   │   ├── users.js
│   │   │   ├── communities.js
│   │   │   ├── materials.js
│   │   │   ├── meetups.js
│   │   │   └── achievements.js
│   │   ├── controllers/       # Route handlers
│   │   │   ├── authController.js
│   │   │   ├── userController.js
│   │   │   ├── communityController.js
│   │   │   ├── materialController.js
│   │   │   ├── meetupController.js
│   │   │   └── achievementController.js
│   │   ├── middleware/        # Custom middleware
│   │   │   ├── auth.js
│   │   │   ├── upload.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   ├── socket/           # WebSocket handlers
│   │   │   └── socketHandler.js
│   │   └── utils/            # Utility functions
│   │       ├── generateToken.js
│   │       ├── sendEmail.js
│   │       └── helpers.js
│   ├── package.json
│   ├── server.js
│   └── .env
│
├── README.md
└── .gitignore
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MongoDB (local installation or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/campus-connect.git
cd campus-connect
```

2. **Set up the backend**
```bash
cd backend
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up the frontend**
```bash
cd ../frontend
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Environment Variables

**Backend (.env):**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campus-connect
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=30d

# Gemini AI
GEMINI_API_KEY=your_api_key

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

**Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Running the Application

1. **Start the backend server**
```bash
cd backend
npm run dev
```

2. **Start the frontend development server**
```bash
cd frontend
npm run dev
```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Community Endpoints
- `GET /api/communities` - Get all communities
- `POST /api/communities` - Create a new community
- `GET /api/communities/:id` - Get community details
- `POST /api/communities/:id/join` - Join a community
- `DELETE /api/communities/:id/leave` - Leave a community

### Meetup Endpoints
- `GET /api/meetups` - Get all meetups
- `POST /api/meetups` - Create a new meetup
- `GET /api/meetups/:id` - Get meetup details
- `POST /api/meetups/:id/join` - Join a meetup
- `PUT /api/meetups/:id` - Update meetup details

### Study Materials Endpoints
- `GET /api/materials` - Get all study materials
- `POST /api/materials` - Upload new study material
- `GET /api/materials/:id` - Get material details
- `DELETE /api/materials/:id` - Delete study material

## 🎯 Core Features

### 1. User Authentication & Profiles
- Secure user registration and login
- JWT-based authentication
- Comprehensive student profiles with academic information
- Profile customization and settings

### 2. Community System
- University-specific communities
- Subject-based study groups
- Community discovery and joining
- Member management and moderation

### 3. Study Materials Sharing
- File upload and storage via Cloudinary
- Categorized resource library
- Search and filter functionality
- Rating and review system

### 4. Meetup Organization
- Create and schedule study sessions
- Video conferencing integration
- Attendance tracking
- Recurring meetup support

### 5. Real-time Collaboration
- Live chat during study sessions
- Collaborative whiteboard
- Screen sharing capabilities
- Real-time notifications

### 6. Achievements & Gamification
- Progress tracking
- Badge system for various activities
- Leaderboards and competitions
- Study streak tracking

## 🔧 Development

### Code Quality
- ESLint configuration for consistent code style
- Prettier for code formatting
- TypeScript for type safety
- Proper error handling and validation

### Database Schema
- **Users**: Profile information, academic details, preferences
- **Communities**: University groups, subject communities
- **StudyMaterials**: Uploaded resources with metadata
- **Meetups**: Scheduled sessions with participant management
- **Achievements**: User progress and badge system
- **LiveSessions**: Real-time collaboration data

### Security Features
- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on API endpoints
- File upload validation and security
- CORS configuration for secure cross-origin requests

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist folder to your hosting platform
```

### Backend Deployment (Railway/Heroku)
```bash
cd backend
# Set environment variables in your hosting platform
# Deploy with your platform-specific commands
```

### Environment Variables in Production
- Update `VITE_API_URL` to point to your production backend
- Configure MongoDB Atlas for database
- Set up Cloudinary for file storage
- Configure SMTP for email notifications

## 🧪 Testing

### API Testing with curl
```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@university.edu",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe",
    "university": "Tech University",
    "course": "Computer Science",
    "year": 3
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@university.edu",
    "password": "password123"
  }'
```

### Frontend Testing
```bash
cd frontend
npm run test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## 📝 Known Issues & Solutions

### Common Development Issues

1. **Community Interaction Features Missing**
   - Ensure backend API endpoints are properly connected
   - Check if user authentication is working correctly
   - Verify community membership status in the database

2. **Mongoose Populate Errors**
   - Remove .populate() calls if referenced models don't exist
   - Ensure all model references are properly defined
   - Check database connections and model relationships

3. **CORS Issues**
   - Configure CORS properly in backend
   - Ensure frontend and backend URLs match environment variables



## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hackathon Organizers** for the opportunity
- **University Community** for inspiration and feedback
- **Open Source Libraries** that made this project possible
- **Development Team** for collaborative effort

## 👥 Contributors

- **[Dylan Fourie](https://github.com/DylanFourie1996)** - Backend Developer
- **[Joash Padiachy](https://github.com/Joashp01)** - Frontend Developer & UI/UX Designer  
- **[Phalanndwa Munyai](https://github.com/ST10356476)** - Full-Stack Developer

---

**Built with ❤️ for students, by students**

*Campus Connect - Connecting minds, building futures* 🎓✨
