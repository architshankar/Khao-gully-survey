import express from 'express';
import {
  submitSurvey,
  getSurveyProgress,
  getAllSurveys,
  getSurveyById,
  getSurveyStats
} from '../controllers/surveyController.js';
import { validateSurveySubmission } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /api/survey/submit
 * @desc    Submit a new survey response
 * @access  Public
 */
router.post('/submit', validateSurveySubmission, submitSurvey);

/**
 * @route   GET /api/survey/progress
 * @desc    Get current survey progress (count towards goal)
 * @access  Public
 */
router.get('/progress', getSurveyProgress);

/**
 * @route   GET /api/survey/stats
 * @desc    Get aggregated survey statistics
 * @access  Public
 */
router.get('/stats', getSurveyStats);

/**
 * @route   GET /api/survey/all
 * @desc    Get all survey responses (paginated)
 * @access  Public (Consider adding authentication in production)
 */
router.get('/all', getAllSurveys);

/**
 * @route   GET /api/survey/:id
 * @desc    Get a specific survey response by ID
 * @access  Public (Consider adding authentication in production)
 */
router.get('/:id', getSurveyById);

export default router;
