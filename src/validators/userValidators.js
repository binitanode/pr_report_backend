const { body, param, query, validationResult } = require('express-validator');

// Validation result middleware
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

// User registration validation
const validateUserRegistration = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('role')
    .optional()
    .isString()
    .withMessage('Role must be a String'),
  
  body('user_type')
    .optional()
    .isString()
    .withMessage('User type must be a String'),

  body('user_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Username must be between 2 and 50 characters'),
  
  body('user_id')
    .optional()
    .isString()
    .withMessage('User ID must be a string'),
  
  body('profile_image')
    .optional()
    .isString()
    .withMessage('Profile image must be a String'),
  
  body('avatar')
    .optional()
    .isString()
    .withMessage('Avatar must be a String'),
  
  handleValidationErrors
];

// User login validation
const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// User update validation
const validateUserUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),
  
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('role')
    .optional()
    .isString()
    .withMessage('Role must be a string'),
  
  body('status')
    .optional()
    .isString()
    .withMessage('Status must be a String'),
  
  body('isBlocked')
    .optional()
    .isBoolean()
    .withMessage('isBlocked must be a boolean'),
  
  body('user_type')
    .optional()
    .isString()
    .withMessage('User type must be a String'),
  
  body('profile_image')
    .optional()
    .isString()
    .withMessage('Profile image must be a String'),
  
  body('avatar')
    .optional()
    .isString()
    .withMessage('Avatar must be a String'),
  
  handleValidationErrors
];

// User ID validation
const validateUserId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  
  handleValidationErrors
];

// User query validation
const validateUserQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search term cannot be empty'),
  
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'suspended'])
    .withMessage('Invalid status filter'),
  
  query('role')
    .optional()
    .isMongoId()
    .withMessage('Invalid role ID'),
  
  handleValidationErrors
];

// Forgot password validation
const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  handleValidationErrors
];

// Reset password validation
const validateResetPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('otp')
    .isInt({ min: 100000, max: 999999 })
    .withMessage('OTP must be a 6-digit number'),
  
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  handleValidationErrors
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateUserId,
  validateUserQuery,
  validateForgotPassword,
  validateResetPassword,
  handleValidationErrors
};
