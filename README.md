# Collaborative Code Editor

A real-time collaborative code editor similar to Google Docs, built with React.js, Node.js, Express, and MongoDB.

## Features

- Real-time code editing with multiple users
- Syntax highlighting for popular programming languages
- Version control and change tracking
- Real-time chat functionality
- User authentication (signup, login, logout)
- Code snippet sharing

## Project Structure

```
collaborative-code-editor/
├── frontend/           # React.js frontend application
├── backend/           # Node.js and Express backend server
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/code-editor
   JWT_SECRET=your_jwt_secret
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

4. Start the frontend development server:
   ```bash
   npm start
   ```

## Technologies Used

- Frontend:
  - React.js
  - Socket.io-client
  - Monaco Editor
  - Material-UI
  - Redux Toolkit

- Backend:
  - Node.js
  - Express
  - Socket.io
  - MongoDB
  - JWT Authentication
  - bcrypt

## License

MIT 