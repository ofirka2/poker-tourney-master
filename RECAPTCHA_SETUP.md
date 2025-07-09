# reCAPTCHA Setup for Poker Tournament Manager

## Overview

This application now includes Google reCAPTCHA v2 protection on the login and signup forms to prevent automated attacks and improve security.

## Implementation Details

### Files Modified/Created

1. **`index.html`** - Added reCAPTCHA script
2. **`src/components/auth/ReCaptcha.tsx`** - New reCAPTCHA component
3. **`src/components/auth/LoginForm.tsx`** - Integrated reCAPTCHA into login/signup forms

### Features

- **reCAPTCHA v2 Checkbox** - Users must check "I'm not a robot" before submitting forms
- **Automatic Reset** - reCAPTCHA resets on form errors or tab switches
- **Error Handling** - Clear error messages when reCAPTCHA is not completed
- **Responsive Design** - Properly styled and centered within the form

### Configuration

The reCAPTCHA site key is currently configured as:
```typescript
const RECAPTCHA_SITE_KEY = '6Lf62HwrAAAAAOc8NLxr4FuIIuYyZV_yVY6cd4SD';
```

### How It Works

1. **Login Form**: Users must complete reCAPTCHA before signing in
2. **Signup Form**: Users must complete reCAPTCHA before creating an account
3. **Validation**: Forms are blocked if reCAPTCHA is not completed
4. **Error Handling**: Clear feedback when reCAPTCHA expires or fails

### Security Benefits

- Prevents automated bot attacks
- Reduces spam registrations
- Protects against brute force login attempts
- Improves overall application security

### Testing

To test the reCAPTCHA implementation:

1. Start the development server: `npm run dev`
2. Navigate to the login page
3. Try submitting forms without completing reCAPTCHA
4. Verify that forms are blocked until reCAPTCHA is completed
5. Test both login and signup flows

### Production Considerations

For production deployment:

1. Ensure the reCAPTCHA site key is valid for your domain
2. Consider using environment variables for the site key
3. Test thoroughly in production environment
4. Monitor reCAPTCHA analytics for any issues

### Troubleshooting

If reCAPTCHA doesn't load:

1. Check browser console for errors
2. Verify the site key is correct
3. Ensure the domain is authorized in Google reCAPTCHA console
4. Check network connectivity to Google's servers

### Future Enhancements

Potential improvements:

- Add reCAPTCHA v3 for invisible protection
- Implement server-side verification
- Add analytics tracking
- Support for multiple languages 