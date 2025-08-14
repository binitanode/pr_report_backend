// src/errors/errorHandler.js
const ApiError = require("./ApiError").default;

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 404;
  res.status(statusCode).json({ message: err.message });
};
