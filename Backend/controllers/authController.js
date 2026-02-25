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

    const redirectUrl = `${req.protocol}://${req.get('host')}/api/auth/callback`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true
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
 * Handle OAuth callback
 */
export const handleOAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=no_code`);
    }

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    console.log('Received session from Supabase callback:', data);
    if (error || !data.session) {
      console.log('OAuth code exchange failed', error);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=auth_failed`);
    }

    // domain restriction on returned user
    const user = data.session.user;
    const allowed = ['@kiit.ac.in', '@kims.ac.in'];
    const email = (user.email || '').toLowerCase();
    if (!allowed.some(d => email.endsWith(d))) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=unauthorized_domain`);
    }

    // send session to frontend
    res.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}?session=${encodeURIComponent(JSON.stringify(data.session))}`
    );
  } catch (err) {
    console.error('callback error', err);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=callback_failed`);
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

    if (error || !user) {
      return res.status(200).json({
        status: 'success',
        data: { user: null, session: null }
      });
    }

    // domain restriction
    const allowedDomains = ['@kiit.ac.in', '@kims.ac.in'];
    const email = (user.email || '').toLowerCase();
    console.log('Domain check for', email);
    if (!allowedDomains.some(d => email.endsWith(d))) {
      console.log('Domain restriction failed for', email);
      return res.status(403).json({
        status: 'error',
        message: 'Unauthorized domain',
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
