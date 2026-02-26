import supabase from '../config/supabase.js';

/**
 * Initiate OAuth flow with Google
 */
export const initiateOAuth = async (req, res, next) => {
  try {
    const { provider } = req.params;
    
    if (provider !== 'google') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid OAuth provider. Only google is supported.'
      });
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3000'}`,
      },
    });

    if (error) {
      console.error('OAuth error:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        url: data.url
      }
    });
  } catch (error) {
    console.error('OAuth initiation failed:', error);
    next(error);
  }
};



/**
 * Get current session
 */
export const getSession = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(200).json({
        status: 'success',
        data: { user: null, session: null }
      });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(200).json({
        status: 'success',
        data: { user: null, session: null }
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
export const logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      await supabase.auth.signOut();
    }

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};
