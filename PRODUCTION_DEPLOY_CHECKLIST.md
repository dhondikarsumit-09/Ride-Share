## RideShare Production Deploy Checklist

### Backend
- Use `prod` profile, not `local`
- Use PostgreSQL, not H2
- Set strong `APP_JWT_SECRET`
- Set `APP_CORS_ALLOWED_ORIGINS` to deployed frontend domain only
- Keep `APP_SWAGGER_ENABLED=false`
- Keep `AUTH_PUBLIC_ADMIN_SIGNUP_ENABLED=false`
- Keep `APP_DEMO_SEED_DRIVER_QUEUE=false`
- Configure live Razorpay keys
- Configure live Resend sender/domain
- Run behind HTTPS reverse proxy

### Frontend
- Set `VITE_API_BASE_URL`
- Set `VITE_WS_BASE_URL`
- Keep `VITE_ENABLE_PUBLIC_ADMIN_ACCESS=false`
- Keep `VITE_ENABLE_DEMO_DRIVER_QUEUE=false`
- Build with production env only

### Admin access
- Do not expose public admin signup
- Create admin users manually in DB or internal tooling
- Use separate browser/profile for rider, driver, admin QA

### Final smoke tests
- passenger signup/login
- driver login and accept ride
- admin login
- OTP mail
- payment success/failure
- ride completion with OTP
- complaint/admin action
