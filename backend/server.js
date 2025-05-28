const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/code-editor', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  // Join a room (document)
  socket.on('join-document', (documentId) => {
    socket.join(documentId);
    console.log(`User joined document: ${documentId}`);
  });

  // Handle code changes
  socket.on('code-change', (data) => {
    socket.to(data.documentId).emit('code-update', data);
  });

  // Handle chat messages
  socket.on('send-message', (data) => {
    io.to(data.documentId).emit('receive-message', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 