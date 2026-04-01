// .env se saari settings load karo
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-diagnosis';

// Vercel serverless ke liye connection cache — baar baar naya connection na bane
let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });

  isConnected = true;
  console.log('MongoDB connected successfully');
}

// Vercel ke liye: pehle DB connect karo, phir request handle karo
const handler = async (req, res) => {
  await connectDB();
  return app(req, res);
};

// Local development ke liye normal server start karo
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  }).catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
}

// Vercel ke liye export
module.exports = handler;
