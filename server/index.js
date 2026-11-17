const app = require('./app');
const env = require('./config/env');
const { connectDB } = require('./config/db');

const startServer = async () => {
  // Connect to database (non-blocking if DB is starting up)
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`[Server] Urban Air Quality Assistant API running on port ${env.PORT} (${env.NODE_ENV})`);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    console.log('\n[Server] Shutting down gracefully...');
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

if (require.main === module) {
  startServer();
}

module.exports = startServer;
