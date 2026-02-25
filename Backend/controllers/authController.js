import supabase from '../config/supabase.js';

/**
 * Initiate OAuth flow with Google
 */
export const initiateOAuth = async (req, res, next) => {
  try {
    const { provider } = req.params;
    console.log('🚀 OAuth initiation for provider:', provider);
    
    if (provider !== 'google') {
      console.error('❌ Invalid provider:', provider);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid OAuth provider. Only google is supported.'
      });
    }

    const redirectUrl = `${req.protocol}://${req.get('host')}/api/auth/callback`;
    console.log('🔗 Redirect URL:', redirectUrl);
    console.log('📄 Request details - Protocol:', req.protocol, 'Host:', req.get('host'));
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true
      },
    });

    if (error) {
      console.error('❌ OAuth error from Supabase:', error);
      return res.status(500).json({
        status: 'error',
        message: error.message
      });
    }

    if (data && data.url) {
      console.log('✅ OAuth URL generated successfully');
      res.status(200).json({
        status: 'success',
        data: {
          url: data.url
        }
      });
    } else {
      console.error('❌ No OAuth URL in response');
      res.status(500).json({
        status: 'error',
        message: 'Failed to generate OAuth URL'
      });
    }
  } catch (error) {
    console.error('❌ OAuth initiation failed:', error.message);
    next(error);
  }
};



/**
 * Handle OAuth callback
 */
export const handleOAuthCallback = async (req, res) => {
  try {
    const { code } = req.query;
    console.log('🔐 OAuth Callback received with code:', code ? 'YES' : 'NO');
    
    if (!code) {
      console.error('❌ No authorization code in callback');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=no_code`);
    }

    console.log('🔄 Exchanging code for session...');
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    console.log('📦 Supabase response:', {
      hasData: !!data,
      hasError: !!error,
      hasSession: !!(data && data.session),
      errorMessage: error?.message
    });

    if (error) {
      console.error('❌ OAuth code exchange error:', error);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=auth_failed&details=${encodeURIComponent(error.message)}`);
    }

    if (!data || !data.session) {
      console.error('❌ No session returned from Supabase');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=no_session`);
    }

    // domain restriction on returned user
    const user = data.session.user;
    const allowed = ['@kiit.ac.in', '@kims.ac.in'];
    const email = (user.email || '').toLowerCase();
    console.log('✉️ User email:', email);
    console.log('✅ Domain check:', allowed.some(d => email.endsWith(d)) ? 'PASSED' : 'FAILED');
    
    if (!allowed.some(d => email.endsWith(d))) {
      console.error('❌ Unauthorized domain:', email);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=unauthorized_domain`);
    }

    // send session to frontend
    const sessionString = encodeURIComponent(JSON.stringify(data.session));
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}?session=${sessionString}`;
    console.log('✅ OAuth successful! Redirecting to:', redirectUrl.split('?')[0]);
    res.redirect(redirectUrl);
  } catch (err) {
    console.error('❌ Callback error:', err.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}?error=callback_failed&details=${encodeURIComponent(err.message)}`);
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
