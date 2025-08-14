// src/errors/errorHandler.js
const ApiError = require("./ApiError").default;

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  // Create a consistent error response format
  const errorResponse = {
    success: false,
    message: err.message || "Something went wrong",
    statusCode: statusCode,
    timestamp: new Date().toISOString()
  };

  // Add additional error details in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = err;
  }

  res.status(statusCode).json(errorResponse);
};
