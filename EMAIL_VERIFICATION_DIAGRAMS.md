# Email Verification - Flow Diagrams & Architecture

## 🔄 User Registration Flow

```
┌─────────────┐
│   User      │
│  Signup     │
│  Form       │
└──────┬──────┘
       │ name, email, password
       ▼
┌──────────────────────────┐
│  POST /auth/signup       │
│  AuthController          │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  AuthService.signup()                    │
│  ├─ Check if email exists               │
│  ├─ Hash password (bcrypt)              │
│  ├─ Generate verification token        │
│  ├─ Create user (isVerified: false)     │
│  └─ Send verification email            │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────┐
│  UserService.create()    │
│  (Save to database)      │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│  EmailService.sendVerificationEmail()│
│  ├─ Get SMTP config                  │
│  ├─ Generate HTML template           │
│  ├─ Create verification link         │
│  └─ Send via Nodemailer              │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────┐
│  User receives email     │
│  with verification link  │
│                          │
│  Click: ✓ Verify Email  │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────────────────────┐
│  GET /auth/verify-email?token=...       │
│  Frontend redirects with token          │
└──────┬───────────────────────────────────┘
       │
       ▼
┌──────────────────────────┐
│  AuthService.verifyEmail()│
│  ├─ Find user by token   │
│  ├─ Check token valid    │
│  ├─ Mark as verified     │
│  ├─ Clear token          │
│  └─ Send welcome email   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│  Account Activated! ✅    │
│  Ready to Login          │
└──────────────────────────┘
```

---

## 🔐 Login Flow with Verification Check

```
┌──────────────────────┐
│  User Login Form     │
│  email, password     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────┐
│  POST /auth/login            │
│  LoginDto validation         │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────┐
│  AuthService.login()                             │
│  ├─ Find user by email                          │
│  │  └─ UserService.findOneByEmail()             │
│  │                                               │
│  ├─ Check user exists                           │
│  │  └─ Return 401 if not found                  │
│  │                                               │
│  ├─ Check password hash matches                 │
│  │  └─ Return 401 if mismatch                   │
│  │                                               │
│  ├─ ✨ NEW: Check isVerified = true             │
│  │  ├─ If false:                                │
│  │  │  └─ Return 401 "Please verify email"      │
│  │  └─ If true:                                 │
│  │     └─ Continue                              │
│  │                                               │
│  └─ Generate JWT token                          │
└──────┬───────────────────────────────────────────┘
       │
       ├─────────────────────┬──────────────────────┐
       │                     │                      │
       ▼                     ▼                      ▼
   ✅ Success         ❌ Not Verified       ❌ Invalid Creds
   (return JWT)      (401 Unauthorized)    (401 Unauthorized)
```

---

## 📧 Email Service Architecture

```
┌────────────────────────────────────────────────────┐
│           EMAIL SERVICE FLOW                       │
└────────────────────────────────────────────────────┘

EmailService
├─ initializeTransporter()
│  ├─ Get SMTP config from ConfigService
│  │  ├─ SMTP_HOST (env)
│  │  ├─ SMTP_PORT (env)
│  │  ├─ SMTP_USER (env)
│  │  └─ SMTP_PASSWORD (env)
│  └─ Create Nodemailer transporter
│
├─ sendVerificationEmail(email, name, link)
│  ├─ Get HTML template
│  ├─ Create mail options
│  │  ├─ from: EMAIL_FROM
│  │  ├─ to: email
│  │  ├─ subject: "Verify Your Email"
│  │  └─ html: template with link
│  ├─ Send via transporter.sendMail()
│  └─ Log result
│
└─ sendWelcomeEmail(email, name)
   ├─ Get HTML template
   ├─ Create mail options
   ├─ Send via transporter.sendMail()
   └─ Log result

┌────────────────────────────────────────────────────┐
│         EXTERNAL SMTP PROVIDERS                    │
└────────────────────────────────────────────────────┘

Gmail
├─ Host: smtp.gmail.com
├─ Port: 587
├─ TLS: Enabled
└─ Auth: App Password

SendGrid
├─ Host: smtp.sendgrid.net
├─ Port: 587
├─ TLS: Enabled
└─ Auth: API Key

AWS SES
├─ Host: email-smtp.region.amazonaws.com
├─ Port: 587
├─ TLS: Enabled
└─ Auth: SMTP Credentials

Brevo
├─ Host: smtp-relay.brevo.com
├─ Port: 587
├─ TLS: Enabled
└─ Auth: SMTP Username/Password
```

---

## 💾 Database Schema

```
┌────────────────────────────────────────────────────┐
│              USERS TABLE                           │
├────────────────────────────────────────────────────┤
│ Column                    │ Type        │ Notes    │
├──────────────────────────────────────────────────┤
│ id                        │ UUID        │ PK      │
│ name                      │ VARCHAR     │ NOT NULL│
│ email                     │ VARCHAR     │ UNIQUE  │
│ password                  │ VARCHAR     │ Hashed  │
│ role                      │ ENUM        │ DEFAULT │
│ avatar                    │ TEXT        │ NULL    │
│ provider                  │ VARCHAR     │ Default │
│ created_at                │ TIMESTAMP   │ Auto    │
│ updated_at                │ TIMESTAMP   │ Auto    │
│                           │             │         │
│ ✨ is_verified            │ BOOLEAN     │ DEFAULT │
│ ✨ verification_token     │ VARCHAR(500)│ NULL    │
│ ✨ verification_token_exp │ TIMESTAMP   │ NULL    │
├────────────────────────────────────────────────────┤
│ INDEXES:                                           │
│ - idx_users_email                                 │
│ - idx_users_verification_token (NEW)              │
│ - idx_users_is_verified (NEW)                     │
└────────────────────────────────────────────────────┘

USER STATES:
┌──────────────────────────────┐
│  New Signup                  │
│  is_verified: false          │
│  verification_token: xxxxx   │
│  verification_token_exp: +24h│
└────────────┬─────────────────┘
             │ (after clicking link)
             ▼
┌──────────────────────────────┐
│  Email Verified              │
│  is_verified: true           │
│  verification_token: NULL    │
│  verification_token_exp: NULL│
└──────────────────────────────┘
```

---

## 🔌 API Endpoint Structure

```
┌─────────────────────────────────────────────────────────┐
│            AUTH ENDPOINTS                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  POST /auth/signup                                      │
│  ├─ Input: SignupDto { name, email, password }         │
│  ├─ Output: { message, user }                          │
│  └─ Status: 201 Created / 409 Conflict / 500 Error     │
│                                                          │
│  GET /auth/verify-email?token=xxx                       │
│  ├─ Input: Query parameter 'token'                     │
│  ├─ Output: { message, user }                          │
│  └─ Status: 200 OK / 400 Bad Request                   │
│                                                          │
│  POST /auth/verify-email                               │
│  ├─ Input: VerifyEmailDto { token }                    │
│  ├─ Output: { message, user }                          │
│  └─ Status: 200 OK / 400 Bad Request                   │
│                                                          │
│  POST /auth/login                                       │
│  ├─ Input: LoginDto { email, password }                │
│  ├─ Output: { access_token, user }                     │
│  └─ Status: 200 OK / 401 Unauthorized / 400 Bad Request│
│                                                          │
│  GET /auth/profile (requires JWT)                       │
│  ├─ Input: Authorization header (JWT)                  │
│  ├─ Output: { id, email, name, role }                  │
│  └─ Status: 200 OK / 401 Unauthorized                  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🗂️ Module Dependencies

```
┌────────────────────────────────────────┐
│         APP MODULE                     │
│  ├─ AuthModule                         │
│  ├─ UserModule                         │
│  ├─ EmailModule (NEW)                  │
│  ├─ JwtModule                          │
│  └─ ConfigModule                       │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│      AUTH MODULE                       │
│  ├─ Imports:                           │
│  │  ├─ UserModule                      │
│  │  ├─ EmailModule (NEW)               │
│  │  ├─ PassportModule                  │
│  │  └─ JwtModule                       │
│  │                                     │
│  ├─ Controllers:                       │
│  │  └─ AuthController                  │
│  │                                     │
│  ├─ Providers:                         │
│  │  └─ AuthService                     │
│  │                                     │
│  └─ Exports:                           │
│     ├─ AuthService                     │
│     ├─ JwtModule                       │
│     └─ PassportModule                  │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│      EMAIL MODULE (NEW)                │
│  ├─ Imports:                           │
│  │  └─ ConfigModule                    │
│  │                                     │
│  ├─ Providers:                         │
│  │  └─ EmailService                    │
│  │                                     │
│  └─ Exports:                           │
│     └─ EmailService                    │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│      USER MODULE                       │
│  ├─ Imports:                           │
│  │  └─ TypeOrmModule                   │
│  │                                     │
│  ├─ Providers:                         │
│  │  └─ UserService                     │
│  │                                     │
│  └─ Exports:                           │
│     └─ UserService                     │
└────────────────────────────────────────┘
```

---

## 🔐 Verification Token Generation

```
┌──────────────────────────────────────────────┐
│  generateVerificationToken()                 │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│  randomBytes(32)                             │
│  32 bytes = 256 bits cryptographic entropy   │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│  .toString('hex')                            │
│  32 bytes → 64 hex characters                │
│  Example:                                    │
│  a3f8b2c9d4e1f7a8b3c9d4e1f7a8b3c9          │
│  d4e1f7a8b3c9d4e1f7a8b3c9d4e1f7a8          │
└──────┬───────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────┐
│  Store in database: verification_token       │
│  Include in email link:                      │
│  https://frontend.com/verify-email?token=xxx │
│  Set expiration: now + 24 hours              │
└──────────────────────────────────────────────┘

SECURITY:
- Random bytes from crypto module (cryptographically secure)
- 256-bit entropy (2^256 possible tokens)
- Unique per user
- Stored hashed in production (optional enhancement)
- Expires after 24 hours
- Cleared after verification
```

---

## ⏰ Token Lifecycle

```
Timeline:
0h          Token Generated
├─ Stored in database
├─ Sent in verification email
└─ Valid for verification

1h-24h      Token Valid
├─ User can click link anytime
├─ Email can be forwarded
└─ Grace period for user action

24h         Token Expires
├─ Verification link becomes invalid
├─ User must signup again
└─ New token generated

After Verification  Token Cleared
├─ Set to NULL
├─ Can never be reused
└─ User marked as verified

┌─────────────────────────────────────────┐
│  User Action Timeline                   │
├─────────────────────────────────────────┤
│ T+0s    │ User completes signup form   │
│ T+1s    │ Server creates account       │
│ T+2s    │ Verification email sent      │
│ T+30s   │ Email arrives in inbox       │
│ T+60s   │ User opens email             │
│ T+90s   │ User clicks verification link│
│ T+92s   │ Account marked as verified   │
│ T+95s   │ User redirected to login     │
│ T+120s  │ User logs in successfully    │
└─────────────────────────────────────────┘
```

---

## 🔄 Error Handling Flow

```
┌─────────────────────────────────────────────────┐
│  SIGNUP ERROR SCENARIOS                         │
└─────────────────────────────────────────────────┘

Scenario 1: Email Already Exists
├─ Check if user exists
└─ Return: 409 Conflict
   "Email already exists"

Scenario 2: Invalid Email Format
├─ DTO validation
└─ Return: 400 Bad Request
   "Email should be an email"

Scenario 3: Password Too Short
├─ DTO validation (MinLength 6)
└─ Return: 400 Bad Request
   "Password too short"

Scenario 4: Email Sending Fails
├─ Send email fails
├─ Delete user from database
└─ Return: 500 Internal Server Error
   "Failed to send verification email"

┌─────────────────────────────────────────────────┐
│  LOGIN ERROR SCENARIOS                          │
└─────────────────────────────────────────────────┘

Scenario 1: Email Not Verified
├─ Check isVerified flag
├─ Flag is false
└─ Return: 401 Unauthorized
   "Please verify your email before logging in"

Scenario 2: Invalid Email
├─ User not found
└─ Return: 401 Unauthorized
   "Invalid email or password"

Scenario 3: Wrong Password
├─ bcrypt.compare fails
└─ Return: 401 Unauthorized
   "Invalid email or password"

┌─────────────────────────────────────────────────┐
│  VERIFICATION ERROR SCENARIOS                   │
└─────────────────────────────────────────────────┘

Scenario 1: No Token Provided
├─ Token parameter missing
└─ Return: 400 Bad Request
   "Verification token is required"

Scenario 2: Invalid Token
├─ Token not found in database
└─ Return: 400 Bad Request
   "Invalid or expired verification token"

Scenario 3: Token Expired
├─ Current time > expiration time
└─ Return: 400 Bad Request
   "Verification token has expired"
```

---

## 📊 Request/Response Flow

```
REQUEST: POST /auth/signup
┌──────────────────────────────────────┐
│ {                                    │
│   "name": "John Doe",               │
│   "email": "john@example.com",      │
│   "password": "SecurePass123!"      │
│ }                                    │
└──────────────────────────────────────┘
         │ SignupDto validation
         ▼
PROCESSING (Async):
┌──────────────────────────────────────┐
│ 1. Check email exists (DB query)    │
│ 2. Hash password (bcrypt)           │
│ 3. Generate verification token      │
│ 4. Create user record (DB insert)   │
│ 5. Send email (SMTP)                │
│ 6. Return response                  │
└──────────────────────────────────────┘
         │
         ▼
RESPONSE: 201 Created
┌──────────────────────────────────────┐
│ {                                    │
│   "message": "Registration ...",    │
│   "user": {                          │
│     "id": "uuid",                    │
│     "email": "john@example.com",    │
│     "name": "John Doe",             │
│     "isVerified": false             │
│   }                                  │
│ }                                    │
└──────────────────────────────────────┘
```

---

## 🔐 Security Layers

```
Layer 1: Input Validation
├─ DTO validation (email format, password length)
├─ Type checking (TypeScript)
└─ Sanitization

Layer 2: Authentication
├─ Password hashing (bcrypt 10 rounds)
├─ JWT tokens (HS256)
└─ Token expiration

Layer 3: Email Verification
├─ Secure token generation (32 random bytes)
├─ Token expiration (24 hours)
├─ One-time use (token cleared after use)
└─ Account inactive until verification

Layer 4: Transport
├─ TLS/SSL encryption (port 587)
├─ SMTP authentication
└─ HTTPS recommended for API

Layer 5: Database
├─ Password field marked select: false
├─ Token fields marked select: false
├─ Indexes for performance
└─ Foreign key constraints

Layer 6: Logging
├─ No passwords logged
├─ No full tokens logged
├─ Error messages generic
└─ Debug info only in dev mode
```

---

## 📈 Performance Optimization

```
Database Query Performance:
┌───────────────────────────────────────┐
│ Query: Find user by email             │
│ Without index: O(n) full table scan   │
│ With index: O(log n) B-tree search    │
│ Impact: 100x faster for large tables  │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ Query: Find unverified users          │
│ Without index: O(n) full table scan   │
│ With index: O(log n) B-tree search    │
│ Impact: Faster unverified user emails │
└───────────────────────────────────────┘

Email Sending:
┌───────────────────────────────────────┐
│ Async processing (non-blocking)       │
│ User sees response immediately        │
│ Email sent in background              │
│ No timeout issues                     │
└───────────────────────────────────────┘

Caching Opportunities (Future):
├─ Cache verified user status
├─ Cache verification tokens in Redis
├─ Cache email templates
└─ Cache SMTP connection pool
```

---

## 🚀 Deployment Architecture

```
DEVELOPMENT:
┌──────────────────────────────────────┐
│ Local Database (PostgreSQL)          │
│ Local SMTP (Mailhog or Gmail)        │
│ Backend: localhost:3000              │
│ Frontend: localhost:5173             │
└──────────────────────────────────────┘

STAGING:
┌──────────────────────────────────────┐
│ Staging Database                     │
│ SendGrid or Test SMTP                │
│ Backend: staging.api.example.com     │
│ Frontend: staging.example.com        │
└──────────────────────────────────────┘

PRODUCTION:
┌──────────────────────────────────────┐
│ Production Database (RDS/Managed)    │
│ Production SMTP (SendGrid/AWS SES)   │
│ Backend: api.example.com             │
│ Frontend: example.com                │
│ CDN enabled                          │
│ SSL/TLS certificates                 │
│ Backup and recovery plan             │
└──────────────────────────────────────┘
```

---

## 📋 Implementation Checklist Visualization

```
Setup Phase (10 min)
├─ ✅ Install dependencies
├─ ✅ Run migration
├─ ✅ Configure SMTP
└─ ✅ Update environment

Code Phase (20 min)
├─ ✅ Copy new files
├─ ✅ Update existing files
├─ ✅ Verify no errors
└─ ✅ Start backend

Testing Phase (20 min)
├─ ✅ Test signup endpoint
├─ ✅ Check email delivery
├─ ✅ Test verification
└─ ✅ Test login flow

Frontend Phase (20 min)
├─ ✅ Create verify page
├─ ✅ Update forms
├─ ✅ Test full flow
└─ ✅ Deploy frontend

Total Time: ~1.5 hours
```

---

This visual representation helps understand:
- User workflows
- System architecture
- Data flow
- Error handling
- Security layers
- Performance considerations
- Deployment options

Refer back to these diagrams during implementation!
