# Pathfinder Backend

A comprehensive career guidance backend API for college students across Software Engineering, AI/ML, and Data Analytics domains.

## 🚀 Features

- **User Authentication** - JWT-based register/login system
- **Multi-Domain Support** - SE, AI/ML, Data Analytics
- **Progress Tracking** - Problems solved, questions practiced, topics completed
- **DSA Problems** - Curated problems with external links and video solutions
- **Interview Questions** - Topic-wise interview preparation
- **AI Chat Assistant** - Gemini/OpenAI integration for doubt solving
- **Roadmaps** - Structured learning paths for each domain

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **AI Integration**: Google Gemini AI / OpenAI

## 📁 Folder Structure
pathfinder-backend/
├── config/ # Configuration files
├── models/ # Database models
├── controllers/ # Business logic
├── routes/ # API routes
├── middlewares/ # Custom middlewares
├── services/ # Core services (AI, etc.)
├── utils/ # Helper functions
├── constants/ # Constants and enums
├── .env # Environment variables
└── app.js # Main application file

## ⚙️ Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pathfinder-backend.git
   cd pathfinder-backend
Install dependencies

bash
npm install
Set up environment variables
Create a .env file in the root directory:

env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
GEMINI_API_KEY=your_gemini_api_key
Start the server

bash
npm start
# or for development
npm run dev
📡 API Endpoints
Authentication
POST /api/auth/register - Register new user

POST /api/auth/login - Login user

User
GET /api/users/profile - Get user profile

PUT /api/users/profile - Update profile

POST /api/users/career-path - Select career path

Problems
GET /api/problems - Get all problems

GET /api/problems/:id - Get problem by ID

AI Assistant
POST /api/ai/chat - Chat with AI

POST /api/ai/explain - Explain a problem

📝 License
MIT License

📧 Contact
Your Name - danugokul850@gmail.com

Project Link: https://github.com/yourusername/pathfinder-backend



