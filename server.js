// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // ✅ CORS import
const authRoutes = require('./routes/authRoutes');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
app.use(express.json());

// ✅ Enable CORS for frontend origin
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

app.use('/api/auth', authRoutes);
connectDB(); // ✅ Connect to MongoDB before app starts

const passwordRoutes = require('./routes/passwordRoutes');
app.use('/api/password', passwordRoutes);



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
