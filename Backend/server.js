// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import morgan from 'morgan';
// import dotenv from 'dotenv';
// import surveyRoutes from './routes/surveyRoutes.js';
// import authRoutes from './routes/authRoutes.js';
// import { errorHandler } from './middleware/errorHandler.js';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Security middleware
// app.use(helmet());

// // CORS configuration
// const allowedOrigins = process.env.ALLOWED_ORIGINS 
//   ? process.env.ALLOWED_ORIGINS.split(',') 
//   : ['https://khao-gully-survey.vercel.app', 'http://localhost:3000'];

// app.use(cors({
//   origin: (origin, callback) => {
//     // Allow requests with no origin (mobile apps, Postman, etc.)
//     if (!origin) return callback(null, true);
    
//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true
// }));

// // Body parsing middleware
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Logging middleware
// if (process.env.NODE_ENV !== 'production') {
//   app.use(morgan('dev'));
// }

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.status(200).json({
//     status: 'success',
//     message: 'Server is running',
//     timestamp: new Date().toISOString()
//   });
// });

// // API routes
// app.use('/api/auth', authRoutes);
// app.use('/api/survey', surveyRoutes);

// // 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({
//     status: 'error',
//     message: `Route ${req.originalUrl} not found`
//   });
// });

// // Global error handler
// app.use(errorHandler);

// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
//   console.log(`🔗 Health check: http://localhost:${PORT}/health`);
// });

// export default app;
































import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import surveyRoutes from './routes/surveyRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------- CORS FIRST --------------------
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [
      'https://khao-gully-survey.vercel.app',
      'http://localhost:3000',
    ];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// -------------------- SECURITY --------------------
app.use(helmet());

// -------------------- BODY PARSING --------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------- LOGGING --------------------
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// -------------------- HEALTH CHECK --------------------
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// -------------------- ROUTES --------------------
app.use('/api/auth', authRoutes);
app.use('/api/survey', surveyRoutes);

// -------------------- 404 --------------------
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
});

// -------------------- ERROR HANDLER --------------------
app.use(errorHandler);

// -------------------- START --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
