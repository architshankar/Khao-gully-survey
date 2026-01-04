import * as surveyService from '../services/surveyService.js';

/**
 * Submit a new survey response
 */
export const submitSurvey = async (req, res, next) => {
  try {
    const surveyData = req.body;
    
    const result = await surveyService.createSurvey(surveyData);
    
    res.status(201).json({
      status: 'success',
      message: 'Survey submitted successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current survey progress
 */
export const getSurveyProgress = async (req, res, next) => {
  try {
    const progress = await surveyService.getProgress();
    
    res.status(200).json({
      status: 'success',
      data: progress
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all survey responses with pagination
 */
export const getAllSurveys = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'created_at', order = 'desc' } = req.query;
    
    const result = await surveyService.getAllSurveys({
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      order
    });
    
    res.status(200).json({
      status: 'success',
      data: result.data,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        limit: result.limit
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific survey by ID
 */
export const getSurveyById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const survey = await surveyService.getSurveyById(id);
    
    if (!survey) {
      return res.status(404).json({
        status: 'error',
        message: 'Survey not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: survey
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get aggregated survey statistics
 */
export const getSurveyStats = async (req, res, next) => {
  try {
    const stats = await surveyService.getSurveyStatistics();
    
    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
