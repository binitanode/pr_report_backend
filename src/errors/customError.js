// src/errors/customError.js
class CustomError extends Error {
  constructor(err) {
    super("Something went wrong"); // generic message to client
    this.statusCode = 500;

    if (err && (err.statusCode || err.status)) {
      this.statusCode = err.statusCode || err.status;
    }

    this.originalError = err;

    if (err instanceof Error) {
      console.error("Original Error Stack:", err.stack);
    } else {
      console.error("Original Error:", err);
    }
  }
}

const toCustomError = (err) => new CustomError(err);

// default-style export + named export
module.exports = toCustomError;
module.exports.CustomError = CustomError;
