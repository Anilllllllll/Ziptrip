const express = require('express');
const cors = require('cors');
const todoRoutes = require('./routes/todoRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for cross-origin requests from the React frontend
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Todo Backend API is running' });
});

// Mount Todo API routes
app.use('/api/todos', todoRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
