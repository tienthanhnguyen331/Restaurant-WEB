# Forgot Password with Email Verification - Implementation Guide

## Overview

This document provides a complete implementation guide for the **Forgot Password with Email Verification** feature integrated with the existing Restaurant-WEB project.

---

## 🏗️ Architecture

### Components Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│ • LoginScreen (Added link to forgot password)                │
│ • ForgotPasswordScreen (New)                                 │
│ • ResetPasswordScreen (New)                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓ (axios)
┌─────────────────────────────────────────────────────────────┐
│                    Backend (NestJS)                          │
├─────────────────────────────────────────────────────────────┤
│ • AuthController                                              │
│   ├─ POST /auth/forgot-password                              │
│   └─ POST /auth/reset-password                               │
│ • AuthService                                                 │
│   ├─ forgotPassword(email: string)                           │
│   └─ resetPassword(token: string, newPassword: string)       │
│ • UserService                                                 │
│   └─ findByResetPasswordToken(token: string)                 │
│ • EmailService                                                │
│   └─ sendResetPasswordEmail(...)                             │
│ • User Entity (Extended with reset fields)                   │
└─────────────────────────────────────────────────────────────┘
                          ↓ (TypeORM)
┌─────────────────────────────────────────────────────────────┐
│               Database (MySQL/PostgreSQL)                    │
├─────────────────────────────────────────────────────────────┤
│ • users table (Extended with reset_password_token fields)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Database Schema Changes

### User Entity - New Fields

```typescript
// Added to User entity in user.entity.ts:
@Column({ nullable: true, select: false, name: 'reset_password_token' })
resetPasswordToken?: string;

@Column({ nullable: true, select: false, name: 'reset_password_token_expires' })
resetPasswordTokenExpires?: Date;
```

### SQL Migration

```sql
-- database/migrations/add_reset_password_fields.sql

ALTER TABLE users ADD COLUMN reset_password_token VARCHAR(255) NULL DEFAULT NULL;
ALTER TABLE users ADD COLUMN reset_password_token_expires TIMESTAMP NULL DEFAULT NULL;

CREATE INDEX idx_users_reset_password_token ON users(reset_password_token);
```

**Run migration:**

```bash
# If using TypeORM migrations
npm run migration:run

# Or execute SQL directly in your database client
mysql -u root -p restaurant_db < database/migrations/add_reset_password_fields.sql
```

---

## 🔐 Security Features

### 1. Secure Token Generation

```typescript
// Uses cryptographically secure random bytes
private generateVerificationToken(): string {
  return randomBytes(32).toString('hex');
}
```

- Uses Node.js `crypto.randomBytes()` for cryptographic security
- Generates 64-character hex string (32 bytes × 2)

### 2. Token Expiration

```typescript
// Default: 15 minutes (configurable via environment variable)
private getResetPasswordTokenExpiration(): Date {
  const expirationMinutes = this.configService.get<number>(
    'RESET_PASSWORD_EXPIRES_IN',
    15,
  );
  return new Date(Date.now() + expirationMinutes * 60 * 1000);
}
```

### 3. Email Enumeration Protection

The `forgotPassword()` endpoint always returns the same success message regardless of whether the email exists or not:

```typescript
// Always returns this message (doesn't reveal email existence)
return {
  message: 'If an account exists with this email, a password reset link will be sent shortly.',
};
```

### 4. Password Hashing

```typescript
// Uses bcrypt with salt rounds = 10 (same as signup)
const hashedPassword = await bcrypt.hash(newPassword, 10);
```

### 5. Token Validation

- Tokens are cleared after successful password reset
- Expired tokens are rejected
- Invalid tokens are rejected

---

## 📝 DTOs (Data Transfer Objects)

### ForgotPasswordDto

```typescript
// packages/backend/src/modules/auth/dto/forgot-password.dto.ts

import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
```

### ResetPasswordDto

```typescript
// packages/backend/src/modules/auth/dto/reset-password.dto.ts

import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}
```

---

## 🔧 Backend Implementation

### AuthService Methods

#### `forgotPassword(email: string)`

```typescript
/**
 * Request password reset - sends reset email
 * Does not reveal whether email exists (for security)
 */
async forgotPassword(email: string) {
  // Find user by email, but don't throw error if not found
  const user = await this.userService.findOneByEmail(email);

  // Always return success message to prevent email enumeration attacks
  if (!user) {
    this.logger.warn(`Forgot password request for non-existent email: ${email}`);
    return {
      message: 'If an account exists with this email, a password reset link will be sent shortly.',
    };
  }

  try {
    // Generate reset token (secure, random, 64 chars)
    const resetPasswordToken = this.generateVerificationToken();
    const resetPasswordTokenExpires = this.getResetPasswordTokenExpiration();

    // Save token to database
    await this.userService.update(user.id, {
      resetPasswordToken,
      resetPasswordTokenExpires,
    });

    // Generate reset link: {FRONTEND_URL}/reset-password?token=...
    const resetLink = this.generateResetPasswordLink(resetPasswordToken);

    // Send reset password email
    await this.emailService.sendResetPasswordEmail(
      user.email,
      user.name,
      resetLink,
    );

    this.logger.log(`Password reset email sent to ${user.email}`);
  } catch (error) {
    this.logger.error(`Failed to send reset password email to ${email}:`, error);
  }

  return {
    message: 'If an account exists with this email, a password reset link will be sent shortly.',
  };
}
```

**Flow:**

1. Find user by email
2. If not found, return generic success (don't leak email existence)
3. Generate secure 64-character random token
4. Set expiration to 15 minutes from now
5. Save token to database
6. Generate reset link with token as query parameter
7. Send email with reset link
8. Return generic success message

---

#### `resetPassword(token: string, newPassword: string)`

```typescript
/**
 * Reset password with token
 */
async resetPassword(token: string, newPassword: string) {
  if (!token) {
    throw new BadRequestException('Reset token is required');
  }

  // Find user with this reset token
  const user = await this.userService.findByResetPasswordToken(token);

  if (!user) {
    throw new BadRequestException('Invalid or expired reset token');
  }

  // Check if token is still valid
  if (
    user.resetPasswordTokenExpires &&
    new Date(user.resetPasswordTokenExpires) < new Date()
  ) {
    throw new BadRequestException('Reset token has expired. Please request a new password reset.');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password and clear reset token
  await this.userService.update(user.id, {
    password: hashedPassword,
    resetPasswordToken: undefined,
    resetPasswordTokenExpires: undefined,
  });

  this.logger.log(`Password reset successfully for ${user.email}`);

  return {
    message: 'Password reset successfully! You can now log in with your new password.',
  };
}
```

**Flow:**

1. Validate token exists
2. Find user by reset token
3. Check if token hasn't expired
4. Hash new password using bcrypt
5. Update user password and clear reset token fields
6. Return success message

---

### UserService Method

#### `findByResetPasswordToken(token: string)`

```typescript
async findByResetPasswordToken(token: string): Promise<User | null> {
  return this.userRepository.findOne({
    where: { resetPasswordToken: token },
    select: [
      'id',
      'email',
      'name',
      'resetPasswordToken',
      'resetPasswordTokenExpires',
    ],
  });
}
```

---

### AuthController Endpoints

#### `POST /auth/forgot-password`

```typescript
@Post('forgot-password')
@HttpCode(HttpStatus.OK)
async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
  return await this.authService.forgotPassword(forgotPasswordDto.email);
}
```

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response (Success):**

```json
{
  "message": "If an account exists with this email, a password reset link will be sent shortly."
}
```

**Status:** `200 OK`

---

#### `POST /auth/reset-password`

```typescript
@Post('reset-password')
@HttpCode(HttpStatus.OK)
async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
  return await this.authService.resetPassword(
    resetPasswordDto.token,
    resetPasswordDto.newPassword,
  );
}
```

**Request:**

```json
{
  "token": "a1b2c3d4e5f6... (64 character hex)",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (Success):**

```json
{
  "message": "Password reset successfully! You can now log in with your new password."
}
```

**Status:** `200 OK`

**Response (Error - Invalid/Expired Token):**

```json
{
  "statusCode": 400,
  "message": "Invalid or expired reset token"
}
```

**Status:** `400 Bad Request`

---

### EmailService Method

#### `sendResetPasswordEmail(email, name, resetLink)`

```typescript
async sendResetPasswordEmail(
  email: string,
  name: string,
  resetLink: string,
): Promise<void> {
  try {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM', 'noreply@restaurant.com'),
      to: email,
      subject: 'Reset Your Password - Restaurant App',
      html: this.getResetPasswordEmailTemplate(name, resetLink),
    };

    await this.transporter.sendMail(mailOptions);
    this.logger.log(`Password reset email sent successfully to ${email}`);
  } catch (error) {
    this.logger.error(`Failed to send password reset email to ${email}:`, error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
```

**Email Template:**

The email includes:

- Professional header with Restaurant App branding
- Greeting with user name
- Clear explanation of password reset request
- Prominent red button: "Reset Password"
- Copy-paste link (for cases button doesn't work)
- ⏰ Warning about 15-minute expiration
- Security tips
- Support contact information
- Professional footer

---

## 🎨 Frontend Implementation

### ForgotPasswordScreen Component

**Location:** `packages/frontend/src/features/auth/ForgotPasswordScreen.tsx`

**Features:**

- Email input with validation
- Loading state
- Success message confirmation
- Error handling
- Navigation to login
- Option to try another email

**Usage:**

```tsx
import { ForgotPasswordScreen } from './features/auth/ForgotPasswordScreen';

// In routes:
<Route path="/forgot-password" element={<ForgotPasswordScreen />} />
```

**Flow:**

1. User enters email
2. Submits form
3. Backend sends reset email (if user exists)
4. Show confirmation message
5. Option to return to login

---

### ResetPasswordScreen Component

**Location:** `packages/frontend/src/features/auth/ResetPasswordScreen.tsx`

**Features:**

- Reads token from URL query parameter: `/reset-password?token=...`
- Password input with show/hide toggle
- Confirm password input with validation
- Password match validation
- Loading state
- Error handling
- Security warnings

**Usage:**

```tsx
import { ResetPasswordScreen } from './features/auth/ResetPasswordScreen';

// In routes:
<Route path="/reset-password" element={<ResetPasswordScreen />} />
```

**Flow:**

1. User clicks reset link from email
2. Redirected to `/reset-password?token=...`
3. User enters new password
4. Backend validates token and updates password
5. Redirect to login on success

---

### LoginScreen Update

Added "Forgot Password?" link:

```tsx
<Link to="/forgot-password" className="text-blue-500 hover:text-blue-700">
  Quên mật khẩu?
</Link>
```

---

## 🧪 Testing Instructions

### Prerequisites

- Backend running: `npm run start`
- Frontend running: `npm run dev`
- Database migrated with new columns
- Email service configured (SMTP settings in `.env`)

---

### Manual Testing Workflow

#### 1. Test Forgot Password Flow

**Step 1:** Navigate to login page
```
URL: http://localhost:5173/login
```

**Step 2:** Click "Forgot Password?" link
```
Redirected to: http://localhost:5173/forgot-password
```

**Step 3:** Enter a valid email (must be registered)
```
Input: user@example.com
Click: "Gửi Liên Kết Đặt Lại" (Send Reset Link)
```

**Expected Result:**
- Display success message: "Nếu tài khoản với email này tồn tại..."
- Email should be sent to user@example.com

**Step 4:** Check email inbox
```
Subject: "Reset Your Password - Restaurant App"
Contains: Reset link with token
Example: http://localhost:5173/reset-password?token=a1b2c3d4e5f6...
```

---

#### 2. Test Password Reset

**Step 1:** Click reset link in email

**Step 2:** Page should load with password fields
```
URL: http://localhost:5173/reset-password?token=...
Shows: "Đặt Lại Mật Khẩu" form
```

**Step 3:** Enter new password
```
New Password: SecurePass123!
Confirm Password: SecurePass123!
```

**Step 4:** Click "Đặt Lại Mật Khẩu" (Reset Password)

**Expected Result:**
- Success message: "Password reset successfully!"
- Auto-redirect to login page
- Can now login with new password

---

#### 3. Test Edge Cases

**Test 3a: Invalid Token**

```bash
# Visit with fake token
URL: http://localhost:5173/reset-password?token=invalid_token_here
```

**Expected:** Error message "Invalid or expired reset token"

---

**Test 3b: Expired Token**

```bash
# Wait 15 minutes (or modify RESET_PASSWORD_EXPIRES_IN in .env to 1 minute)
# Try to use the reset link
```

**Expected:** Error message "Reset token has expired..."

---

**Test 3c: No Token**

```bash
# Visit without token
URL: http://localhost:5173/reset-password
```

**Expected:** Error message "Không có token được cung cấp"

---

**Test 3d: Non-existent Email**

```bash
# Use forgot-password with non-existent email
Email: nonexistent@fake.com
Click: Send
```

**Expected:** Same generic success message (doesn't reveal if email exists)

---

**Test 3e: Email Mismatch**

```bash
# Try to reset with mismatched passwords
New Password: Password123
Confirm Password: Password456
Click: Reset
```

**Expected:** Error message "Mật khẩu không trùng khớp"

---

### API Testing with cURL/Postman

#### Test Forgot Password Endpoint

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

**Response:**

```json
{
  "message": "If an account exists with this email, a password reset link will be sent shortly."
}
```

---

#### Test Reset Password Endpoint

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "a1b2c3d4e5f6...actual_token_from_email",
    "newPassword": "NewPassword123!"
  }'
```

**Response (Success):**

```json
{
  "message": "Password reset successfully! You can now log in with your new password."
}
```

**Response (Error - Invalid Token):**

```json
{
  "statusCode": 400,
  "message": "Invalid or expired reset token"
}
```

---

### Database Verification

```sql
-- Check if reset token fields were added
DESCRIBE users;
-- Look for: reset_password_token, reset_password_token_expires

-- Check if token is stored when reset is requested
SELECT id, email, reset_password_token, reset_password_token_expires FROM users WHERE email = 'user@example.com';

-- Check if token is cleared after reset
-- (Should show NULL after successful password reset)
```

---

### Email Verification

**Check if email is being sent:**

1. **Using MailHog (local testing):**
   ```bash
   # Run MailHog: mailhog
   # Access UI: http://localhost:1025
   # Check for reset email
   ```

2. **Using Real Email Service:**
   - Check inbox directly
   - Check spam folder
   - Verify SMTP settings in `.env`

---

## 🔧 Configuration

### Environment Variables

Add these to `.env`:

```bash
# Email settings (already existing, used by reset feature)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@restaurant.com

# Reset password token expiration (minutes)
RESET_PASSWORD_EXPIRES_IN=15

# Frontend URL (for reset link in email)
FRONTEND_URL=http://localhost:5173

# For production
# FRONTEND_URL=https://your-domain.com
```

### Environment File Example (`.env.local`)

```env
# === Database ===
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=password
DATABASE_NAME=restaurant_db

# === JWT ===
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=24h

# === Email (SMTP) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=restaurant.noreply@gmail.com
SMTP_PASSWORD=your_app_password
EMAIL_FROM=Restaurant App <restaurant.noreply@gmail.com>

# === Email Verification ===
EMAIL_VERIFICATION_EXPIRES_IN=24

# === Password Reset ===
RESET_PASSWORD_EXPIRES_IN=15

# === Frontend ===
FRONTEND_URL=http://localhost:5173

# === API ===
API_URL=http://localhost:3000/api
```

---

## 📊 Feature Checklist

- [x] User entity extended with reset password fields
- [x] DTOs created (ForgotPasswordDto, ResetPasswordDto)
- [x] AuthService methods implemented (forgotPassword, resetPassword)
- [x] UserService method (findByResetPasswordToken)
- [x] AuthController endpoints added (POST /forgot-password, POST /reset-password)
- [x] EmailService method (sendResetPasswordEmail)
- [x] Email template with proper styling
- [x] ForgotPasswordScreen component created
- [x] ResetPasswordScreen component created
- [x] Routes added to App.tsx
- [x] Login screen updated with forgot password link
- [x] Database migration created
- [x] Security measures implemented (token validation, expiration, hashing)
- [x] Email enumeration protection
- [x] Error handling and validation
- [x] TypeScript strict mode compatible

---

## 🚀 Deployment Checklist

Before deploying to production:

1. **Run Database Migration**
   ```bash
   npm run migration:run
   # OR manually execute add_reset_password_fields.sql
   ```

2. **Update Environment Variables**
   - Set correct `FRONTEND_URL` (production URL)
   - Configure SMTP for production email service
   - Update `RESET_PASSWORD_EXPIRES_IN` if needed

3. **Build Backend**
   ```bash
   npm run build
   ```

4. **Build Frontend**
   ```bash
   npm run build
   ```

5. **Run Tests**
   ```bash
   npm run test
   ```

6. **Verify Email Configuration**
   - Test sending reset password email
   - Verify link format in email

7. **Monitor Logs**
   - Check backend logs for errors
   - Monitor email delivery

---

## 🐛 Troubleshooting

### Issue: Email not being sent

**Solution:**
1. Verify SMTP credentials in `.env`
2. Check email service provider (Gmail requires app password)
3. Check backend logs for errors
4. Verify email isn't being marked as spam

```bash
# Check logs
tail -f logs/application.log | grep -i email
```

---

### Issue: Reset link not working

**Solution:**
1. Verify `FRONTEND_URL` is correctly set in `.env`
2. Check link format in email
3. Ensure token is being stored in database
4. Check if token has expired

```sql
SELECT id, email, reset_password_token, reset_password_token_expires 
FROM users 
WHERE email = 'user@example.com';
```

---

### Issue: Token validation failing

**Solution:**
1. Ensure database migration was executed
2. Check `reset_password_token` field exists in database
3. Verify token expiration logic
4. Check if `select: false` is preventing token retrieval

---

### Issue: Password not updating

**Solution:**
1. Check user permissions
2. Verify password is being hashed correctly
3. Check database transaction logs
4. Ensure TypeORM update method is working

---

## 📚 Related Documentation

- [Email Verification Implementation](./EMAIL_VERIFICATION_IMPLEMENTATION.md)
- [Authentication Documentation](./user_auth_README.md)
- [NestJS Best Practices](https://docs.nestjs.com)
- [React Hook Form](https://react-hook-form.com)
- [TypeORM Documentation](https://typeorm.io)

---

## ✅ Summary

The **Forgot Password with Email Verification** feature has been successfully implemented with:

- ✅ Secure token generation and validation
- ✅ Email-based password reset workflow
- ✅ Email enumeration protection
- ✅ 15-minute token expiration
- ✅ Bcrypt password hashing
- ✅ Professional HTML email template
- ✅ Full TypeScript support
- ✅ Comprehensive error handling
- ✅ Production-ready code

All files are aligned with the existing codebase style and follow NestJS/React best practices.
