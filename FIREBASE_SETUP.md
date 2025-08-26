# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for your Chronosi application.

## Prerequisites

- A Google account
- Node.js and npm installed
- Your React application running

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `chronosi-auth` (or your preferred name)
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project dashboard, click "Authentication" in the left sidebar
2. Click "Get started"
3. Click "Email/Password" under "Sign-in method"
4. Enable "Email/Password" authentication
5. Click "Save"

## Step 3: Get Firebase Configuration

1. Click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "chronosi-web")
6. Copy the `firebaseConfig` object

## Step 4: Update Firebase Configuration

1. Open `src/config/firebase.ts`
2. Replace the placeholder values with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## Step 5: Test the Application

1. Start your React application: `npm run dev`
2. Navigate to `/signup` to create a new account
3. Navigate to `/login` to sign in
4. Test protected routes like `/study-plan`

## Features Included

✅ **User Registration** - Create new accounts with email/password
✅ **User Login** - Sign in with existing credentials  
✅ **Protected Routes** - Automatic authentication checks
✅ **Error Handling** - User-friendly error messages
✅ **Loading States** - Proper loading indicators
✅ **Automatic Redirects** - Smart navigation after auth
✅ **Session Persistence** - Users stay logged in across page refreshes

## How It Works

1. **FirebaseAuthProvider** wraps your app and manages authentication state
2. **useFirebaseAuth** hook provides authentication methods throughout your app
3. **ProtectedRoute** component automatically redirects unauthenticated users
4. **Firebase handles** all the complex authentication logic, token management, and security

## Troubleshooting

### Common Issues

1. **"Firebase: Error (auth/invalid-api-key)"**
   - Check that you've copied the correct API key from Firebase Console

2. **"Firebase: Error (auth/operation-not-allowed)"**
   - Make sure Email/Password authentication is enabled in Firebase Console

3. **"Firebase: Error (auth/network-request-failed)"**
   - Check your internet connection
   - Verify Firebase project is not paused

4. **Authentication not persisting**
   - Check browser console for errors
   - Verify Firebase config is correct

### Getting Help

- [Firebase Documentation](https://firebase.google.com/docs/auth)
- [Firebase Console](https://console.firebase.google.com/)
- Check browser console for detailed error messages

## Security Notes

- Firebase handles all security best practices automatically
- Passwords are securely hashed and stored
- JWT tokens are automatically managed and refreshed
- Rate limiting is built-in
- HTTPS is enforced in production

## Next Steps

After setting up authentication, you can:

1. **Add Social Login** (Google, Facebook, etc.)
2. **Implement Password Reset**
3. **Add Email Verification**
4. **Set up User Profiles**
5. **Add Role-based Access Control**

## Migration from Custom Backend

This Firebase implementation is designed to be a drop-in replacement for your existing authentication system. The API remains the same, so your components don't need major changes.

If you want to keep your custom backend later, you can easily switch back by:
1. Reverting the import changes
2. Restoring the original AuthContext
3. Starting your backend server
