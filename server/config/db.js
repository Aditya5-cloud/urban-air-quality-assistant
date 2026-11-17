const mongoose = require('mongoose');
const env = require('./env');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return true;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000, // Timeout fast if local mongod is not active
    });

    isConnected = conn.connection.readyState === 1;
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    isConnected = false;
    console.warn(`[Database Warning] MongoDB connection failed: ${error.message}. Running with degraded persistence.`);
    return false;
  }
};

mongoose.connection.on('connected', () => {
  isConnected = true;
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.warn('[Database] MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error(`[Database Error] ${err.message}`);
});

const isDbConnected = () => {
  return mongoose.connection.readyState === 1;
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  isConnected = false;
};

module.exports = {
  connectDB,
  isDbConnected,
  disconnectDB,
};
