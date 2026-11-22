/**
 * Database abstraction layer.
 * Note: MongoDB dependency was removed in favor of an in-memory TTL repository
 * optimized for serverless deployments on platforms such as Vercel.
 */

const isDbConnected = () => true;

const connectDB = async () => {
  return true;
};

const disconnectDB = async () => {
  return true;
};

module.exports = {
  connectDB,
  disconnectDB,
  isDbConnected,
};
