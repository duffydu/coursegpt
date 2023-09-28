require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectToDB = require('./config/connectToDB');
const path = require('path');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const messageRoutes = require('./routes/message');
const chatRoutes = require('./routes/chat');
const feedbackRoutes = require('./routes/feedback');
const feedbackDataRoutes = require('./routes/feedbackData');
const courseRoutes = require('./routes/course');
const schoolRoutes = require('./routes/school');
const getAllRoutes = require('./routes/all');
const passport = require('./config/passport');
const cookieParser = require('cookie-parser');

start();

function start() {
  const app = express();
  const port = process.env.PORT || 3001;
  setupExpress(app);
  setupRoutes(app);
  if (process.env.NODE_ENV !== 'development') serveBuild(app);
  run(app, port);
}

function setupExpress(app) {
  const corsOptions = {
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://research-gpt-client.onrender.com'
        : 'http://localhost:3000',
    credentials: true,
  };
  app.use(cors(corsOptions));
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ limit: '20mb', extended: false }));
  app.use(passport.initialize());
  app.use(cookieParser());
}

function setupRoutes(app) {
  app.use('/api/chats/:chatId/messages/:messageId/feedback', feedbackRoutes);
  app.use('/api/feedbackData', feedbackDataRoutes);
  app.use('/api/chats/:chatId/messages', messageRoutes);
  app.use('/api/chats', chatRoutes);
  app.use('/api/schools/:schoolId/courses', courseRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/schools', schoolRoutes);
  app.use('/api', getAllRoutes);
}

function serveBuild(app) {
  const buildPath = path.join(__dirname, '../client/build');
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(buildPath, 'index.html'));
  });
}

function run(app, port) {
  connectToDB().then(() => {
    app.listen(port, () => {
      console.log(`Running on port ${port}! URL: http://localhost:${port}/`);
    });
  });
}
