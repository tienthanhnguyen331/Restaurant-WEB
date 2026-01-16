# Email Verification - Implementation Checklist

## Pre-Implementation (5 minutes)

- [ ] Review all documentation files
- [ ] Ensure Node.js 16+ is installed
- [ ] Have database access ready
- [ ] Choose email provider (Gmail, SendGrid, AWS SES, etc.)
- [ ] Have email credentials ready

## Step 1: Install Dependencies (2 minutes)

```bash
cd packages/backend
npm install nodemailer
npm install --save-dev @types/nodemailer
```

- [ ] Installation completed without errors
- [ ] No version conflicts reported
- [ ] Dependencies added to package.json

## Step 2: Database Migration (3 minutes)

### Option A: Using psql directly
```bash
psql -U postgres -d restaurant_db -f database/migrations/add_email_verification.sql
```

### Option B: Using TypeORM migrations
1. Create migration file in `database/migrations/`
2. Include the SQL from `add_email_verification.sql`
3. Run migration

**Verification:**
```sql
-- Verify columns exist
\d users

-- Check indexes
SELECT * FROM pg_indexes WHERE tablename = 'users';
```

- [ ] New columns added (`is_verified`, `verification_token`, `verification_token_expires`)
- [ ] Indexes created successfully
- [ ] No migration errors in logs

## Step 3: Code Updates (10 minutes)

### 3.1 Entity Updates
- [ ] Updated `src/modules/user/user.entity.ts` with new fields
- [ ] Column names match database schema (snake_case)

### 3.2 Service Updates
- [ ] Updated `src/modules/user/user.service.ts` with new methods
- [ ] Updated `src/modules/auth/auth.service.ts` with verification logic
- [ ] No TypeScript compilation errors

### 3.3 Controller Updates
- [ ] Updated `src/modules/auth/auth.controller.ts` with new endpoints
- [ ] Added HTTP status codes (`@HttpCode`)
- [ ] Added JSDoc comments

### 3.4 Module Updates
- [ ] Updated `src/modules/auth/auth.module.ts` to import `EmailModule`
- [ ] EmailModule properly exported from email folder

### 3.5 New Files Created
- [ ] Email service: `src/modules/email/email.service.ts`
- [ ] Email module: `src/modules/email/email.module.ts`
- [ ] DTOs created in `src/modules/auth/dto/`
  - [ ] `signup.dto.ts`
  - [ ] `login.dto.ts`
  - [ ] `verify-email.dto.ts`
  - [ ] `index.ts`

### 3.6 Configuration Updates
- [ ] Updated `.env.example` with SMTP settings
- [ ] Added `EMAIL_VERIFICATION_EXPIRES_IN` variable

- [ ] All files in correct locations
- [ ] No import errors
- [ ] All TypeScript compiles without errors

## Step 4: Environment Configuration (3 minutes)

### Choose Email Provider and Configure `.env`

#### Option A: Gmail (Recommended for Testing)
```dotenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
EMAIL_FROM=noreply@restaurant.com
EMAIL_VERIFICATION_EXPIRES_IN=24
FRONTEND_URL=http://localhost:5173
```

**Setup Steps:**
1. [ ] Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. [ ] Enable 2-Step Verification if not already enabled
3. [ ] Navigate to App passwords
4. [ ] Select "Mail" and "Windows Computer"
5. [ ] Copy the generated 16-character password
6. [ ] Paste into `SMTP_PASSWORD` in `.env`

#### Option B: SendGrid
```dotenv
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@restaurant.com
EMAIL_VERIFICATION_EXPIRES_IN=24
FRONTEND_URL=http://localhost:5173
```

**Setup Steps:**
1. [ ] Create SendGrid account
2. [ ] Create API key with Mail Send permission
3. [ ] Copy API key to `SMTP_PASSWORD`

#### Option C: AWS SES
```dotenv
SMTP_HOST=email-smtp.region.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-username
SMTP_PASSWORD=your-ses-password
EMAIL_FROM=verified-email@yourdomain.com
EMAIL_VERIFICATION_EXPIRES_IN=24
FRONTEND_URL=http://localhost:5173
```

- [ ] SMTP_HOST configured
- [ ] SMTP_PORT set correctly
- [ ] SMTP_USER configured
- [ ] SMTP_PASSWORD configured
- [ ] EMAIL_FROM set to valid email
- [ ] FRONTEND_URL matches your frontend URL
- [ ] `.env` file saved

## Step 5: Test Backend Connection (5 minutes)

### Start Backend Server
```bash
npm run start:dev
```

- [ ] Server starts without errors
- [ ] No TypeScript compilation errors
- [ ] Backend listening on port 3000

### Test Email Configuration (Optional)
Create a test file: `test-email.ts`
```typescript
import { EmailService } from './src/modules/email/email.service';
import { ConfigService } from '@nestjs/config';

// Test SMTP connection
async function testEmail() {
  const configService = new ConfigService();
  const emailService = new EmailService(configService);
  
  try {
    await emailService.sendVerificationEmail(
      'your-test-email@gmail.com',
      'Test User',
      'http://localhost:5173/verify-email?token=test123'
    );
    console.log('✅ Email sent successfully');
  } catch (error) {
    console.error('❌ Email failed:', error.message);
  }
}

testEmail();
```

- [ ] Test email sent successfully (check spam folder too)
- [ ] Email contains verification link

## Step 6: API Testing (10 minutes)

### Test Signup Endpoint
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "testuser123@gmail.com",
    "password": "TestPass123!"
  }'
```

**Expected Response (201 Created):**
```json
{
  "message": "Registration successful. Please check your email to verify your account.",
  "user": {
    "id": "uuid-here",
    "email": "testuser123@gmail.com",
    "name": "Test User",
    "isVerified": false
  }
}
```

- [ ] Signup endpoint works
- [ ] User created with `isVerified: false`
- [ ] Verification email sent (check inbox)
- [ ] Response status is 201

### Test Email Verification Failure Before Verifying
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser123@gmail.com",
    "password": "TestPass123!"
  }'
```

**Expected Response (401 Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Please verify your email before logging in...",
  "error": "Unauthorized"
}
```

- [ ] Login blocked for unverified email
- [ ] Error message is clear

### Extract Token and Verify Email
1. [ ] Check email inbox for verification link
2. [ ] Copy the token from the link (or URL)
3. [ ] Run verification endpoint:

```bash
curl -X GET "http://localhost:3000/auth/verify-email?token=<your-token-here>"
```

**Expected Response (200 OK):**
```json
{
  "message": "Email verified successfully! Your account is now active.",
  "user": {
    "id": "uuid-here",
    "email": "testuser123@gmail.com",
    "name": "Test User",
    "isVerified": true
  }
}
```

- [ ] Verification endpoint works
- [ ] User marked as `isVerified: true`
- [ ] Welcome email sent (optional)

### Test Login After Verification
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser123@gmail.com",
    "password": "TestPass123!"
  }'
```

**Expected Response (200 OK):**
```json
{
  "access_token": "eyJhbGc...",
  "user": {
    "id": "uuid-here",
    "email": "testuser123@gmail.com",
    "name": "Test User",
    "role": "USER",
    "isVerified": true
  }
}
```

- [ ] Login successful after verification
- [ ] JWT token received
- [ ] User object includes `isVerified: true`

### Test Invalid Token
```bash
curl -X GET "http://localhost:3000/auth/verify-email?token=invalid-token"
```

**Expected Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": "Invalid or expired verification token",
  "error": "Bad Request"
}
```

- [ ] Invalid token rejected with 400 status
- [ ] Clear error message provided

## Step 7: Frontend Integration (15 minutes)

### Create Verify Email Page
- [ ] Create new page: `src/pages/verify-email.tsx` (or .jsx)
- [ ] Add route in router configuration
- [ ] Import and use `useSearchParams()` to get token
- [ ] Call verification endpoint with token
- [ ] Show loading, success, or error state
- [ ] Redirect to login on success

### Example Component:
```typescript
// src/pages/verify-email.tsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/verify-email?token=${token}`
        );
        const data = await response.json();
        
        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
          setTimeout(() => navigate('/login'), 3000);
        } else {
          setStatus('error');
          setMessage(data.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Verification failed. Please try again.');
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="verify-container">
      {status === 'loading' && <p>Verifying your email...</p>}
      {status === 'success' && <p className="success">{message}</p>}
      {status === 'error' && <p className="error">{message}</p>}
    </div>
  );
}
```

- [ ] Verify page created
- [ ] Route configured
- [ ] Token extracted from URL
- [ ] Endpoint called with token
- [ ] Success state shows confirmation
- [ ] Error state shows error message
- [ ] Redirect to login on success

### Update Signup Form
- [ ] Signup form calls new `/auth/signup` endpoint
- [ ] Show success message after signup
- [ ] Instructions to check email
- [ ] Link to verify email if user already has token

### Update Login Form
- [ ] Signup form calls `/auth/login` endpoint
- [ ] Handle error for unverified email
- [ ] Show friendly message about verification
- [ ] Link to resend verification if needed (optional feature)

- [ ] Signup page updated
- [ ] Login page updated
- [ ] Verify email page working
- [ ] Navigation flow correct

## Step 8: Database Verification (5 minutes)

### Check User in Database
```sql
-- Connect to database
psql -U postgres -d restaurant_db

-- Check user record
SELECT id, email, is_verified, verification_token, verification_token_expires 
FROM users 
WHERE email = 'testuser123@gmail.com';

-- Before verification (should have token)
-- After verification (token should be NULL, is_verified should be true)
```

- [ ] User created with correct fields
- [ ] `is_verified` is false initially
- [ ] `verification_token` is populated
- [ ] `verification_token_expires` is 24 hours in future
- [ ] After verification, token is cleared
- [ ] After verification, `is_verified` is true

## Step 9: Error Handling Tests (5 minutes)

### Test Cases
```
Test Case 1: Duplicate Email Signup
- [ ] Signup with existing email
- [ ] Should get 409 Conflict error
- [ ] Message: "Email already exists"

Test Case 2: Invalid Email Format
- [ ] Signup with invalid email
- [ ] Should get 400 Bad Request error
- [ ] Message: "Email should be an email"

Test Case 3: Short Password
- [ ] Signup with password < 6 chars
- [ ] Should get 400 Bad Request error

Test Case 4: Missing Fields
- [ ] Signup with missing name/email/password
- [ ] Should get 400 Bad Request error

Test Case 5: Expired Token
- [ ] Wait 24+ hours (or manually set expiry in DB to past)
- [ ] Try to verify email
- [ ] Should get 400 Bad Request error
- [ ] Message: "Token has expired"

Test Case 6: No Token Provided
- [ ] Call verify endpoint without token
- [ ] Should get 400 Bad Request error
- [ ] Message: "Token is required"
```

- [ ] All error cases handled correctly
- [ ] Error messages are user-friendly
- [ ] Appropriate HTTP status codes returned
- [ ] No sensitive information exposed in errors

## Step 10: Security Review (5 minutes)

- [ ] Password is hashed with bcrypt (rounds: 10)
- [ ] Verification tokens are 64-character random hex (32 bytes)
- [ ] Tokens expire after 24 hours
- [ ] Password field not selected in queries by default
- [ ] SMTP uses TLS/SSL (port 587)
- [ ] JWT tokens signed with JWT_SECRET
- [ ] Sensitive fields marked with `select: false`
- [ ] No sensitive data logged
- [ ] Error messages don't expose sensitive info

## Step 11: Performance Optimization (3 minutes)

### Database Indexes
```sql
-- Verify indexes exist and are being used
EXPLAIN ANALYZE SELECT * FROM users WHERE verification_token = 'token';
EXPLAIN ANALYZE SELECT * FROM users WHERE is_verified = false;
```

- [ ] Indexes created on `verification_token`
- [ ] Indexes created on `is_verified`
- [ ] Query plans show index usage

## Step 12: Documentation (2 minutes)

- [ ] All documentation files present and accurate
- [ ] API Reference complete with examples
- [ ] Quick Start guide reviewed
- [ ] Implementation checklist (this file) reviewed

## Step 13: Clean Up (2 minutes)

- [ ] Remove any test files created
- [ ] Clean up console logs (if added)
- [ ] Verify .env file not committed to git
- [ ] .gitignore includes .env
- [ ] No temporary files left behind

## Final Verification Checklist

### Functionality
- [ ] User can signup with email
- [ ] Verification email is sent
- [ ] User cannot login before verification
- [ ] User can verify email via token
- [ ] User can login after verification
- [ ] Invalid/expired tokens are rejected

### Code Quality
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] No unhandled promise rejections
- [ ] Code follows existing project style
- [ ] All imports are correct
- [ ] No unused imports

### Security
- [ ] Passwords hashed correctly
- [ ] Tokens are cryptographically secure
- [ ] No sensitive data in logs
- [ ] SMTP credentials secure
- [ ] Email validation working
- [ ] SQL injection prevention
- [ ] XSS prevention

### Testing
- [ ] All endpoints tested manually
- [ ] Error cases tested
- [ ] Database state verified
- [ ] Frontend integration working
- [ ] Email delivery confirmed
- [ ] Token expiration working

### Deployment Readiness
- [ ] All environment variables documented
- [ ] Database migration tested
- [ ] Dependencies installed
- [ ] Code committed to git
- [ ] Deployment documentation ready
- [ ] Rollback plan documented

## Deployment Steps

### Staging Environment
1. [ ] Push code to staging branch
2. [ ] Deploy to staging server
3. [ ] Run database migration on staging
4. [ ] Configure staging .env
5. [ ] Test all flows in staging
6. [ ] Verify email delivery in staging

### Production Environment
1. [ ] Create database backup
2. [ ] Push code to production
3. [ ] Run database migration on production
4. [ ] Configure production .env with correct SMTP
5. [ ] Deploy backend
6. [ ] Test production endpoints
7. [ ] Monitor email delivery
8. [ ] Have rollback plan ready

- [ ] Staging deployment successful
- [ ] Production deployment successful
- [ ] All monitoring in place
- [ ] Team notified of changes

## Post-Deployment (Day 1)

- [ ] Monitor email delivery logs
- [ ] Check for signup errors
- [ ] Monitor server logs
- [ ] Check database growth
- [ ] Get feedback from test users
- [ ] Document any issues

## Post-Deployment (Week 1)

- [ ] Monitor email delivery rates
- [ ] Check average verification time
- [ ] Monitor failed verification attempts
- [ ] Review error logs
- [ ] Optimize if needed
- [ ] Document metrics

## Success Criteria

- ✅ 95%+ email delivery rate
- ✅ <2% token expiration rate
- ✅ <5 minute average verification time
- ✅ Zero unhandled errors in production
- ✅ User signup flow complete
- ✅ All tests passing
- ✅ Documentation complete
- ✅ Team trained on feature

---

## Notes Section

Use this space to document any issues, solutions, or custom configurations:

```
Issue #1: 
Solution: 

Issue #2:
Solution:

Custom Configuration:

Additional Notes:
```

---

**Estimated Total Time: 1-2 hours (including testing)**

**Next Steps:**
1. Complete all checklist items
2. Get stakeholder approval
3. Schedule deployment
4. Monitor production
5. Gather user feedback

**Support Contacts:**
- Email Issues: [DevOps Contact]
- Database Issues: [DBA Contact]
- Frontend Issues: [Frontend Lead]
