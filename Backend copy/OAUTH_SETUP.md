# OAuth Setup Guide

## 📋 Configuration Steps

### 1. Configure Supabase Google OAuth

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: `spasuzmyiwdqfszrcjiv`
3. Navigate to **Authentication** → **Providers**

#### Google OAuth Setup:

1. **In Google Cloud Console:**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Create OAuth credentials
   - Add authorized redirect URI:
     ```
     https://spasuzmyiwdqfszrcjiv.supabase.co/auth/v1/callback
     ```

2. **In Supabase Dashboard:**
   - Enable Google provider
   - Paste Client ID and Client Secret

### 2. Update Backend .env

Your `.env` file already has the correct Supabase URL. Make sure the `SUPABASE_ANON_KEY` is correct:

```env
SUPABASE_URL=https://spasuzmyiwdqfszrcjiv.supabase.co
SUPABASE_ANON_KEY=<your_real_anon_key_from_supabase>
FRONTEND_URL=http://localhost:5173
```

Get the anon key from: Supabase Dashboard → Settings → API

## 🚀 How It Works

### Authentication Flow:

```
1. User clicks "Sign in with Google" on frontend
   ↓
2. Frontend calls: GET /api/auth/google
   ↓
3. Backend returns Supabase OAuth URL
   ↓
4. Browser redirects to Google
   ↓
5. User authorizes
   ↓
6. OAuth provider redirects to: /api/auth/callback
   ↓
7. Backend exchanges code for session
   ↓
8. Backend redirects to frontend with session data
   ↓
9. Frontend stores session and shows user as logged in
```

## 🔧 Backend API Endpoints

### GET /api/auth/google
Initiates Google OAuth flow
- Returns: `{ status: 'success', data: { url: '...' } }`

### GET /api/auth/callback
Handles OAuth callback (internal use)

### GET /api/auth/session
Get current user session
- Headers: `Authorization: Bearer <token>`
- Returns: `{ status: 'success', data: { user: {...} } }`

### POST /api/auth/logout
Logout user
- Returns: `{ status: 'success', message: 'Logged out successfully' }`

## ✅ Testing

1. Start backend: `npm run dev`
2. Start frontend: `npm run dev`
3. Click "Sign in with Google/GitHub"
4. Authorize the app"
4. Authorize the app
5. You should be redirected back and logged in

## 🎯 Production

For production deployment:

1. Update `FRONTEND_URL` in backend `.env`
2. Update redirect URIs in Googleroduction domain
