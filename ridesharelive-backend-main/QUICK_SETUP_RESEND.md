# Quick Setup: Resend OTP in 5 Minutes

## TL;DR

1. **Get API Key**: Sign up at [resend.com](https://resend.com) → Copy API key
2. **Set Environment Variable**:
   ```bash
   MAIL_PROVIDER=resend
   RESEND_API_KEY=re_your_key_here
   ```
3. **Optionally set from address** (default: onboarding@resend.dev):
   ```bash
   RESEND_FROM_ADDRESS=noreply@yourdomain.com
   ```
4. **Restart backend** → Done! 🎉

## What Changed?

### New Files
- `ResendOtpEmailService.java` - Handles email sending via Resend
- `RESEND_SETUP.md` - Detailed configuration guide
- `.env.resend.example` - Example environment variables

### Updated Files
- `pom.xml` - Added Resend Java SDK (v0.3.0)
- `application.properties` - Added Resend config options
- `SignupOtpService.java` - Now supports both Resend and SMTP

## Test It

```bash
# Request OTP
curl -X POST http://localhost:8080/auth/signup/request-otp \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "email": "your@email.com"}'

# Check your email for OTP code
# Then verify with signup endpoint
```

## Environment Variables Reference

```bash
# Required
MAIL_PROVIDER=resend              # Switch to Resend
RESEND_API_KEY=re_xxx            # Your API key

# Optional
RESEND_FROM_ADDRESS=noreply@...  # Sender email
MAIL_FROM_NAME=RideShare Live    # Display name
MAIL_OTP_ENABLED=true            # Enable OTP service
```

## Fallback to SMTP

If Resend doesn't work, just change:
```bash
MAIL_PROVIDER=smtp
# Then set MAIL_HOST, MAIL_USERNAME, etc. as before
```

✅ No code changes needed - it auto-detects the provider!

## Support

See `RESEND_SETUP.md` for:
- Full configuration details
- Troubleshooting
- Domain verification
- Monitoring & analytics
