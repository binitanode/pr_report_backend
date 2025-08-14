const { validationResult } = require('express-validator');

// Common validation result middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Pagination validation
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  
  if (pageNum < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page number must be greater than 0'
    });
  }
  
  if (limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100'
    });
  }
  
  req.query.page = pageNum;
  req.query.limit = limitNum;
  next();
};

// Search validation
const validateSearch = (req, res, next) => {
  const { search } = req.query;
  
  if (search && search.trim().length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Search term must be at least 2 characters long'
    });
  }
  
  if (search) {
    req.query.search = search.trim();
  }
  
  next();
};

// ID validation middleware
const validateMongoId = (paramName) => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }
    
    next();
  };
};

// File upload validation
const validateFileUpload = (allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File is required'
      });
    }
    
    if (allowedTypes.length > 0 && !allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      });
    }
    
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
      });
    }
    
    next();
  };
};

// Email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength validation
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    errors: {
      length: password.length < minLength ? `Password must be at least ${minLength} characters` : null,
      uppercase: !hasUpperCase ? 'Password must contain at least one uppercase letter' : null,
      lowercase: !hasLowerCase ? 'Password must contain at least one lowercase letter' : null,
      numbers: !hasNumbers ? 'Password must contain at least one number' : null,
      specialChar: !hasSpecialChar ? 'Password must contain at least one special character' : null
    }
  };
};

// Sanitize input data
const sanitizeInput = (data) => {
  if (typeof data === 'string') {
    return data.trim().replace(/[<>]/g, '');
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return data;
};

module.exports = {
  handleValidationErrors,
  validatePagination,
  validateSearch,
  validateMongoId,
  validateFileUpload,
  validateEmail,
  validatePasswordStrength,
  sanitizeInput
};
