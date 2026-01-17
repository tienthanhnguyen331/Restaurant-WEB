# Email Verification Implementation Guide

## Overview
This document provides a comprehensive guide to implement email verification for account activation in the Restaurant App.

## What Was Implemented

### 1. **Database Schema Updates**
- Added three new columns to the `users` table:
  - `is_verified` (BOOLEAN): Tracks whether the user's email is verified
  - `verification_token` (VARCHAR): Stores the unique verification token
  - `verification_token_expires` (TIMESTAMP): Stores token expiration time (24 hours)
- Created indexes on `verification_token` and `is_verified` for faster queries

### 2. **New Files Created**

#### Email Module
- **File**: `src/modules/email/email.service.ts`
  - Handles all email sending functionality using Nodemailer
  - Generates HTML email templates for verification and welcome emails
  - Configured via environment variables (SMTP settings)

- **File**: `src/modules/email/email.module.ts`
  - NestJS module that exports EmailService

#### DTOs (Data Transfer Objects)
- **File**: `src/modules/auth/dto/signup.dto.ts`
  - Validates signup data (name, email, password)

- **File**: `src/modules/auth/dto/login.dto.ts`
  - Validates login data (email, password)

- **File**: `src/modules/auth/dto/verify-email.dto.ts`
  - Validates verification token

### 3. **Updated Files**

#### User Entity
- **File**: `src/modules/user/user.entity.ts`
- Added three new columns corresponding to database schema

#### User Service
- **File**: `src/modules/user/user.service.ts`
- Added `findByVerificationToken()`: Finds user by verification token
- Added `update()`: Updates user records
- Added `delete()`: Deletes user records
- Added `isVerified` to select fields in `findOneByEmail()`

#### Auth Service
- **File**: `src/modules/auth/auth.service.ts`
- Implemented `signup()`: Creates new user with unverified status and sends verification email
- Implemented `verifyEmail()`: Validates token and marks user as verified
- Updated `login()`: Checks if user email is verified before login
- Added private helpers:
  - `generateVerificationToken()`: Creates secure random token
  - `getTokenExpiration()`: Calculates 24-hour expiration
  - `generateVerificationLink()`: Builds frontend verification URL

#### Auth Controller
- **File**: `src/modules/auth/auth.controller.ts`
- Added `POST /auth/signup`: New endpoint for signup with email verification
- Added `GET /auth/verify-email`: Endpoint to verify email via query parameter
- Added `POST /auth/verify-email`: Alternative endpoint for email verification
- Updated endpoints with JSDoc documentation

#### Auth Module
- **File**: `src/modules/auth/auth.module.ts`
- Imported `EmailModule` to make EmailService available

#### Environment Configuration
- **File**: `.env.example`
- Added SMTP configuration variables
- Added EMAIL_VERIFICATION_EXPIRES_IN configuration

#### Database Migration
- **File**: `database/migrations/add_email_verification.sql`
- SQL script to add new columns and indexes

## Installation & Setup

### Step 1: Install Required Package
```bash
cd packages/backend
npm install nodemailer
npm install --save-dev @types/nodemailer
```

### Step 2: Run Database Migration
```bash
# Connect to your PostgreSQL database and run:
psql -U your_username -d restaurant_db -f database/migrations/add_email_verification.sql
```

Or if using a migration runner, integrate the migration into your migration system.

### Step 3: Configure Environment Variables

Update `.env` file in `packages/backend/`:

#### Option A: Using Gmail SMTP (Recommended for Testing)
```dotenv
# Email Configuration (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@restaurant.com
EMAIL_VERIFICATION_EXPIRES_IN=24
FRONTEND_URL=http://localhost:5173
```

**How to get Gmail App Password:**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Go to "App passwords"
4. Select "Mail" and "Windows Computer"
5. Copy the generated password and use it in SMTP_PASSWORD

#### Option B: Using SendGrid SMTP
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

#### Option C: Using Other SMTP Providers
Configure accordingly:
- **Brevo (formerly Sendinblue)**: `smtp-relay.brevo.com:587`
- **AWS SES**: `email-smtp.region.amazonaws.com:587`
- **Mailgun**: `smtp.mailgun.org:587`

### Step 4: Update Frontend Verify Email Page

Create a verification page in your frontend (e.g., `src/pages/verify-email.tsx`):

```typescript
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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

    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/verify-email?token=${token}`
        );
        setStatus('success');
        setMessage(response.data.message);
        
        // Redirect to login after 3 seconds
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setStatus('error');
        setMessage(
          error.response?.data?.message ||
          'Failed to verify email. Token may be expired.'
        );
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="verify-email-container">
      {status === 'loading' && <p>Verifying your email...</p>}
      {status === 'success' && (
        <div className="success">
          <p>{message}</p>
          <p>Redirecting to login...</p>
        </div>
      )}
      {status === 'error' && (
        <div className="error">
          <p>{message}</p>
          <button onClick={() => navigate('/signup')}>
            Try signing up again
          </button>
        </div>
      )}
    </div>
  );
}
```

## API Endpoints

### 1. **POST /auth/signup**
Register a new user with email verification

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201 Created):**
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

**Possible Errors:**
- `409 Conflict`: Email already exists
- `400 Bad Request`: Invalid input data
- `500 Internal Server Error`: Failed to send email

### 2. **GET /auth/verify-email?token=...**
Verify email using token from email link

**Query Parameters:**
- `token` (required): Verification token from email link

**Response (200 OK):**
```json
{
  "message": "Email verified successfully! Your account is now active.",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "isVerified": true
  }
}
```

**Possible Errors:**
- `400 Bad Request`: Invalid or expired token
- `400 Bad Request`: Token not provided

### 3. **POST /auth/verify-email**
Alternative endpoint to verify email (POST method)

**Request:**
```json
{
  "token": "verification-token-here"
}
```

**Response:** Same as GET endpoint

### 4. **POST /auth/login**
Login with email verification check

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER",
    "isVerified": true
  }
}
```

**Possible Errors:**
- `401 Unauthorized`: Invalid email or password
- `401 Unauthorized`: Email not verified

## Testing Instructions

### Manual Testing with cURL

#### 1. Test Signup
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testPass123"
  }'
```

#### 2. Check Email (in your SMTP service or email client)
- Look for email from `noreply@restaurant.com`
- Extract the verification token from the link

#### 3. Verify Email
```bash
curl -X GET "http://localhost:3000/auth/verify-email?token=<token-from-email>"
```

#### 4. Try Login (should fail if not verified)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPass123"
  }'
```

#### 5. Login After Verification (should succeed)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPass123"
  }'
```

### Testing with Postman

1. **Create Signup Request:**
   - Method: POST
   - URL: `http://localhost:3000/auth/signup`
   - Body (JSON):
     ```json
     {
       "name": "Postman Test",
       "email": "postman@example.com",
       "password": "postmanPass123"
     }
     ```

2. **Monitor Email Delivery:**
   - Check your email inbox (or SMTP logs if using development email service)
   - Copy the verification token

3. **Create Verify Email Request:**
   - Method: GET
   - URL: `http://localhost:3000/auth/verify-email?token=<your-token>`

4. **Create Login Request:**
   - Method: POST
   - URL: `http://localhost:3000/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "postman@example.com",
       "password": "postmanPass123"
     }
     ```

### Unit Testing Example

```typescript
// auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService - Email Verification', () => {
  let authService: AuthService;
  let userService: UserService;
  let emailService: EmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOneByEmail: jest.fn(),
            create: jest.fn(),
            findByVerificationToken: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendVerificationEmail: jest.fn(),
            sendWelcomeEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(() => 'jwt-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key) => {
              const config = {
                FRONTEND_URL: 'http://localhost:5173',
                EMAIL_VERIFICATION_EXPIRES_IN: 24,
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    emailService = module.get<EmailService>(EmailService);
  });

  describe('signup', () => {
    it('should create unverified user and send verification email', async () => {
      const signupData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testPass123',
      };

      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(null);
      jest.spyOn(userService, 'create').mockResolvedValue({
        id: 'user-id',
        ...signupData,
        isVerified: false,
      } as any);

      const result = await authService.signup(signupData);

      expect(userService.findOneByEmail).toHaveBeenCalledWith(signupData.email);
      expect(userService.create).toHaveBeenCalled();
      expect(emailService.sendVerificationEmail).toHaveBeenCalled();
      expect(result.user.isVerified).toBe(false);
    });

    it('should throw ConflictException if email exists', async () => {
      const signupData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'testPass123',
      };

      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue({
        id: 'existing-user',
      } as any);

      expect(authService.signup(signupData)).rejects.toThrow('Email already exists');
    });
  });

  describe('verifyEmail', () => {
    it('should mark user as verified', async () => {
      const token = 'valid-token';
      const user = {
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        verificationToken: token,
        verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      };

      jest.spyOn(userService, 'findByVerificationToken').mockResolvedValue(user as any);
      jest.spyOn(userService, 'update').mockResolvedValue({
        ...user,
        isVerified: true,
      } as any);

      const result = await authService.verifyEmail(token);

      expect(userService.findByVerificationToken).toHaveBeenCalledWith(token);
      expect(userService.update).toHaveBeenCalledWith('user-id', expect.objectContaining({
        isVerified: true,
        verificationToken: null,
      }));
      expect(result.user.isVerified).toBe(true);
    });
  });

  describe('login', () => {
    it('should reject login if email not verified', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'testPass123',
      };

      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue({
        id: 'user-id',
        isVerified: false,
        password: 'hashed-password',
      } as any);

      expect(authService.login(loginData)).rejects.toThrow(
        'Please verify your email before logging in'
      );
    });
  });
});
```

## Error Handling & Responses

### Verification Errors

| Error | HTTP Code | Cause | Solution |
|-------|-----------|-------|----------|
| Email already exists | 409 | User with this email already registered | Use different email or login |
| Invalid or expired token | 400 | Token doesn't exist or has expired (>24h) | Request new signup/resend email |
| Email not verified | 401 | User tries to login before verification | Click verification link in email |
| Failed to send email | 500 | SMTP configuration error or network issue | Check SMTP credentials and connectivity |
| Verification token required | 400 | No token provided in request | Include token in query parameter or body |

## Security Considerations

1. **Token Generation:** Uses cryptographically secure random bytes (`randomBytes(32).toString('hex')`)
2. **Token Expiration:** 24-hour expiration for verification links
3. **Password Hashing:** Uses bcrypt with salt rounds = 10
4. **JWT Tokens:** Signed with secret key from environment
5. **SMTP Security:** Uses TLS/SSL for email transmission
6. **Password Fields:** Not selected by default in queries; only retrieved when needed
7. **Token Storage:** Only stored during verification process, cleared after verification

## Database Schema

```sql
-- Final user table structure
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password" VARCHAR(255),
    "role" user_role DEFAULT 'USER',
    "avatar" TEXT,
    "is_verified" BOOLEAN DEFAULT FALSE,
    "verification_token" VARCHAR(500),
    "verification_token_expires" TIMESTAMP WITH TIME ZONE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON "users"("email");
CREATE INDEX idx_users_verification_token ON "users"("verification_token");
CREATE INDEX idx_users_is_verified ON "users"("is_verified");
```

## Troubleshooting

### Email Not Sending
1. **Check SMTP credentials:** Test with Gmail or SendGrid dashboard
2. **Check logs:** Look for error messages in `auth.service.ts` logger
3. **Allow less secure apps:** For Gmail, ensure "Less secure app access" is enabled
4. **Check firewall:** Port 587 (SMTP) might be blocked by firewall

### Token Verification Issues
1. **Token expired:** Tokens expire after 24 hours
2. **Token not found:** Check token is correctly copied from email
3. **Database not updated:** Ensure migration was run successfully

### Login Issues
1. **Email not verified:** Must click verification link first
2. **Wrong email/password:** Double-check credentials
3. **JWT expired:** Create new login session

## Migration Rollback

If you need to rollback this feature:

```sql
-- Remove email verification fields
ALTER TABLE "users"
DROP COLUMN IF EXISTS "is_verified",
DROP COLUMN IF EXISTS "verification_token",
DROP COLUMN IF EXISTS "verification_token_expires";

-- Drop indexes
DROP INDEX IF EXISTS idx_users_verification_token;
DROP INDEX IF EXISTS idx_users_is_verified;
```

## File Structure Summary

```
Restaurant-WEB/
├── database/
│   └── migrations/
│       └── add_email_verification.sql     [NEW]
├── packages/backend/
│   ├── .env.example                       [UPDATED]
│   └── src/
│       └── modules/
│           ├── auth/
│           │   ├── auth.controller.ts     [UPDATED]
│           │   ├── auth.module.ts         [UPDATED]
│           │   ├── auth.service.ts        [UPDATED]
│           │   └── dto/
│           │       ├── index.ts           [NEW]
│           │       ├── login.dto.ts       [NEW]
│           │       ├── signup.dto.ts      [NEW]
│           │       └── verify-email.dto.ts [NEW]
│           ├── email/                     [NEW FOLDER]
│           │   ├── email.module.ts        [NEW]
│           │   └── email.service.ts       [NEW]
│           └── user/
│               ├── user.entity.ts         [UPDATED]
│               └── user.service.ts        [UPDATED]
```

## Next Steps

1. **Install dependencies:** `npm install nodemailer @types/nodemailer`
2. **Run migration:** Execute SQL migration
3. **Configure .env:** Add SMTP configuration
4. **Update frontend:** Create verify-email page
5. **Test thoroughly:** Follow testing instructions above
6. **Deploy:** Push to production with verified SMTP settings

## Support

For issues or questions:
- Check the troubleshooting section
- Review email service logs
- Verify database migration was successful
- Confirm SMTP credentials are correct
