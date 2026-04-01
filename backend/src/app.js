const express = require('express');
const cors = require('cors');
const diagnosisRoutes = require('./routes/diagnosisRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// CORS setup — kaun kaun se frontend URLs se request aane deni hai
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// JSON body parse karo, max size 10kb
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// saari diagnosis related routes
app.use('/api', diagnosisRoutes);

// agar koi route match nahi hua toh 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// global error handler
app.use(errorHandler);

module.exports = app;
