import { body, validationResult } from 'express-validator';

/**
 * Validation rules for survey submission
 */
export const validateSurveySubmission = [
  // Name validation
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),

  // Branch validation
  body('branch')
    .trim()
    .notEmpty()
    .withMessage('Branch is required')
    .isLength({ max: 50 })
    .withMessage('Branch must not exceed 50 characters'),

  // Hostel validation
  body('hostel')
    .trim()
    .notEmpty()
    .withMessage('Hostel information is required')
    .isLength({ max: 100 })
    .withMessage('Hostel must not exceed 100 characters'),

  // Campus validation
  body('campus')
    .trim()
    .notEmpty()
    .withMessage('Campus is required')
    .isLength({ max: 100 })
    .withMessage('Campus must not exceed 100 characters'),

  // Restaurant 1 validation (mandatory)
  body('restaurant1')
    .trim()
    .notEmpty()
    .withMessage('At least one restaurant choice is required')
    .isLength({ max: 200 })
    .withMessage('Restaurant name must not exceed 200 characters'),

  // Restaurant 2 validation (optional)
  body('restaurant2')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Restaurant name must not exceed 200 characters'),

  // Restaurant 3 validation (optional)
  body('restaurant3')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 })
    .withMessage('Restaurant name must not exceed 200 characters'),

  // Phone number validation
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,5}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,9}$/)
    .withMessage('Please provide a valid phone number'),

  // Pickup spot validation
  body('pickupSpot')
    .trim()
    .notEmpty()
    .withMessage('Pickup spot is required')
    .isLength({ max: 200 })
    .withMessage('Pickup spot must not exceed 200 characters'),

  // Order frequency validation
  body('orderFrequency')
    .trim()
    .notEmpty()
    .withMessage('Order frequency is required')
    .isIn(['Daily', '2–3 times a week', 'Once a week', 'Occasionally', 'Rarely'])
    .withMessage('Invalid order frequency option'),

  // Current apps validation
  body('currentApps')
    .isArray({ min: 1 })
    .withMessage('At least one app must be selected')
    .custom((value) => {
      const validApps = ['Swiggy', 'Zomato', 'Call the restaurant', 'None'];
      return value.every(app => validApps.includes(app));
    })
    .withMessage('Invalid app selection'),

  // Convincing factors validation
  body('convincingFactors')
    .isArray({ min: 1 })
    .withMessage('At least one convincing factor must be selected')
    .custom((value) => {
      const validFactors = ['Lower prices', 'Faster delivery', 'Better offers', 'Better customer support', 'More local restaurants'];
      return value.every(factor => validFactors.includes(factor));
    })
    .withMessage('Invalid convincing factor'),

  // Middleware to handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array().map(err => ({
          field: err.path,
          message: err.msg
        }))
      });
    }
    
    next();
  }
];
