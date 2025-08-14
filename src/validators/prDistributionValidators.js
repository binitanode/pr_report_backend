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


// PR Distribution ID validation
const validatePrDistributionId = [
  param('grid_id')
    .isString()
    .withMessage('Invalid Grid ID'),
  
  handleValidationErrors
];

// PR Distribution query validation
const validatePrDistributionQuery = [
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
  
  query('batch_id')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Batch ID cannot be empty'),
  
  query('recipient')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Recipient cannot be empty'),
  
  query('exchange_symbol')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Exchange symbol cannot be empty'),
  
  query('uploaded_by')
    .optional()
    .isMongoId()
    .withMessage('Invalid uploaded by ID'),
  
  handleValidationErrors
];



// CSV file validation
const validateCsvFile = [
  body('file')
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('CSV file is required');
      }
      
      if (!req.file.mimetype.includes('csv') && !req.file.originalname.endsWith('.csv')) {
        throw new Error('File must be a CSV');
      }
      
      if (req.file.size > 50 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 50MB');
      }
      
      return true;
    }),
  
  handleValidationErrors
];

// PR Distribution share PR Report validation
const validateSharePrReport = [
  param('grid_id')
    .isString()
    .withMessage('Invalid Grid ID'),

  param('email')

    .isEmail()
    .withMessage('Invalid Email'),

  handleValidationErrors
];

// Verify URL validation
const validateVerifyUrl = [
  query('grid_id')
    .notEmpty()
    .withMessage('Grid ID is required')
    .isString()
    .withMessage('Grid ID must be a string'),
  
  query('email')
    .optional()
    .isEmail()
    .withMessage('Email must be a valid email format'),
  
  handleValidationErrors
];

module.exports = {
  validatePrDistributionId,
  validatePrDistributionQuery,
  validateCsvFile,
  validateSharePrReport,
  validateVerifyUrl,
  handleValidationErrors
};
