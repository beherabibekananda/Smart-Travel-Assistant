# Email Configuration Guide

## Setting Up Gmail SMTP for Email Sending

### Step 1: Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", enable "2-Step Verification"
4. Follow the prompts to set it up

### Step 2: Generate App Password
1. After enabling 2-Step Verification, go back to Security
2. Under "Signing in to Google", click on "App passwords"
3. Select "Mail" as the app
4. Select "Other (Custom name)" as the device
5. Enter "Smart Travel Assistant" as the name
6. Click "Generate"
7. **Copy the 16-character password** (without spaces)

### Step 3: Update .env File
Create or update the `.env` file in your project root with:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password-here
FROM_EMAIL=your-email@gmail.com
FROM_NAME=Smart Travel Assistant
```

**Replace:**
- `your-email@gmail.com` with your actual Gmail address
- `your-16-char-app-password-here` with the app password you generated

### Step 4: Restart Backend Server
After updating the .env file, restart your backend server:
```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd "/Users/bibekanandabehera/Desktop/PROJECT AI "
python -m uvicorn app.main:app --reload --port 8000
```

### Step 5: Test
1. Sign up with a real email address
2. Check your inbox for the verification email
3. Enter the OTP code from the email

## Troubleshooting

**Email not received?**
- Check spam/junk folder
- Verify SMTP credentials in .env
- Check backend console for error messages
- Ensure 2-Step Verification is enabled
- Make sure you used an App Password, not your regular password

**"Less secure app" error?**
- Gmail no longer supports "less secure apps"
- You MUST use an App Password (see Step 2)

**Still showing in console only?**
- Check if SMTP_USER and SMTP_PASSWORD are set in .env
- Restart the backend server after updating .env

## Features of the Email System

✅ **Beautiful HTML emails** with branding
✅ **Fallback to console** if SMTP not configured
✅ **Error handling** with fallback printing
✅ **Professional templates** for OTP, password reset, and bookings
✅ **Auto-detection** of configuration (dev vs production mode)
