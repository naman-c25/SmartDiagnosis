// sabse pehle .env file se saari settings load karo (jaise PORT, MONGO_URI)
require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');

// PORT .env se lo, warna default 5000 use karo
const PORT = process.env.PORT || 5000;

// MongoDB ka address .env se lo, warna local database use karo
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-diagnosis';

// pehle MongoDB se connect karo, tab server start karo
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    // agar MongoDB se connection nahi hua toh error dikhao aur band karo
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

// jab server band ho (deploy pe ya manually) toh pehle MongoDB connection theek se close karo
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    process.exit(0);
  });
});
