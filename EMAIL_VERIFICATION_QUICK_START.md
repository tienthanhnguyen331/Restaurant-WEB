# Email Verification - Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### 1. Install Package
```bash
cd packages/backend
npm install nodemailer @types/nodemailer
```

### 2. Run Database Migration
```bash
# Option A: Using psql directly
psql -U postgres -d restaurant_db -f database/migrations/add_email_verification.sql

# Option B: Using your migration tool
# Add migration to your system's migration runner
```

### 3. Configure Environment (.env)
```dotenv
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@restaurant.com
EMAIL_VERIFICATION_EXPIRES_IN=24
FRONTEND_URL=http://localhost:5173
```

### 4. Start Backend
```bash
npm run start:dev
```

## 📋 API Usage Examples

### Signup
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "isVerified": false
  }
}
```

### Verify Email
```bash
curl -X GET "http://localhost:3000/auth/verify-email?token=<token-from-email>"
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

## 🔧 Email Service Providers

### Gmail (Recommended for Testing)
1. Enable 2-Step Verification in Google Account
2. Go to [App passwords](https://myaccount.google.com/apppasswords)
3. Generate password for Mail/Windows Computer
4. Use generated password in `SMTP_PASSWORD`

```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
```

### SendGrid
```dotenv
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
```

### AWS SES
```dotenv
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-username
SMTP_PASSWORD=your-ses-password
```

## ✅ Testing Checklist

- [ ] Installed nodemailer package
- [ ] Ran database migration
- [ ] Configured SMTP credentials
- [ ] Started backend server
- [ ] Tested signup endpoint
- [ ] Received verification email
- [ ] Clicked verification link
- [ ] Logged in successfully
- [ ] Tried to login before verification (should fail)

## 📧 Frontend Integration

### Simple Verify Page
```typescript
// pages/verify-email.tsx
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) return;

    fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email?token=${token}`)
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        navigate('/login');
      })
      .catch(err => alert(err.message));
  }, [searchParams, navigate]);

  return <div>Verifying email...</div>;
}
```

### Signup Component Example
```typescript
async function handleSignup(formData) {
  try {
    const response = await fetch(`${VITE_API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) throw new Error('Signup failed');
    
    const data = await response.json();
    alert(data.message); // "Check your email..."
  } catch (error) {
    alert(error.message);
  }
}
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Email not sending | Check SMTP credentials and firewall port 587 |
| Token expired | Tokens valid for 24 hours, resend if needed |
| Cannot login | Verify email first, check if isVerified is true |
| 400 Bad Request | Check DTO validation - name, email, password required |
| 409 Conflict | Email already exists, use different email |

## 📚 Full Documentation

See [EMAIL_VERIFICATION_IMPLEMENTATION.md](./EMAIL_VERIFICATION_IMPLEMENTATION.md) for complete details.

## 🔒 Security Features

✅ Secure token generation (32 random bytes)  
✅ Token expiration (24 hours)  
✅ Password hashing (bcrypt)  
✅ SMTP TLS/SSL encryption  
✅ JWT authentication  
✅ Password fields hidden from queries  

## 📁 Files Changed

- ✅ `database/migrations/add_email_verification.sql` (NEW)
- ✅ `src/modules/email/` (NEW FOLDER)
- ✅ `src/modules/auth/auth.service.ts` (UPDATED)
- ✅ `src/modules/auth/auth.controller.ts` (UPDATED)
- ✅ `src/modules/auth/auth.module.ts` (UPDATED)
- ✅ `src/modules/auth/dto/` (NEW FILES)
- ✅ `src/modules/user/user.entity.ts` (UPDATED)
- ✅ `src/modules/user/user.service.ts` (UPDATED)
- ✅ `.env.example` (UPDATED)

## Next Steps

1. ✅ Complete setup checklist above
2. ✅ Test all endpoints
3. ✅ Integrate with frontend
4. ✅ Deploy to production
5. ✅ Monitor email delivery

---

For detailed information, error handling, and testing instructions, see the full implementation guide.
