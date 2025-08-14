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

// Role creation validation
const validateRoleCreation = [
  body('_id')
    .optional()
    .isString()
    .withMessage('Role ID must be a string'),
  
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s_-]+$/)
    .withMessage('Role name can only contain letters, spaces, hyphens, and underscores'),
  
  body('permission')
    .isObject()
    .withMessage('Permission must be an object'),
  
  body('permission.*')
    .optional()
    .isBoolean()
    .withMessage('Permission values must be boolean'),
  
  body('user_id')
    .optional()
    .isString()
    .withMessage('User ID must be a string'),
  
  body('user_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('User name must be between 2 and 50 characters'),
  
  handleValidationErrors
];

// Role update validation
const validateRoleUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid role ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Role name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s_-]+$/)
    .withMessage('Role name can only contain letters, spaces, hyphens, and underscores'),
  
  body('permission')
    .optional()
    .isObject()
    .withMessage('Permission must be an object'),
  
  body('permission.*')
    .optional()
    .isBoolean()
    .withMessage('Permission values must be boolean'),
  
  body('user_id')
    .optional()
    .isString()
    .withMessage('User ID must be a string'),
  
  body('user_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('User name must be between 2 and 50 characters'),
  
  handleValidationErrors
];

// Role ID validation
const validateRoleId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid role ID'),
  
  handleValidationErrors
];

// Role query validation
const validateRoleQuery = [
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
  
  query('user_id')
    .optional()
    .isString()
    .withMessage('Invalid user ID'),
  
  handleValidationErrors
];

// Permission update validation
const validatePermissionUpdate = [
  param('id')
    .isMongoId()
    .withMessage('Invalid role ID'),
  
  body('permission')
    .isObject()
    .withMessage('Permission must be an object'),
  
  body('permission.*')
    .isBoolean()
    .withMessage('Permission values must be boolean'),
  
  handleValidationErrors
];

module.exports = {
  validateRoleCreation,
  validateRoleUpdate,
  validateRoleId,
  validateRoleQuery,
  validatePermissionUpdate,
  handleValidationErrors
};
