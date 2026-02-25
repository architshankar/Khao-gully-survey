import express from 'express';
import { initiateOAuth, handleOAuthCallback, getSession, logout } from '../controllers/authController.js';

const router = express.Router();

/**
 * @route   GET /api/auth/callback
 * @desc    Handle OAuth provider callback
 * @access  Public
 */
router.get('/callback', handleOAuthCallback);

/**
 * @route   GET /api/auth/:provider
 * @desc    Initiate OAuth flow with provider (google)
 * @access  Public
 */
router.get('/:provider', initiateOAuth);

/**
 * @route   GET /api/auth/session
 * @desc    Get current user session
 * @access  Public
 */
router.get('/session', getSession);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/logout', logout);

export default router;
