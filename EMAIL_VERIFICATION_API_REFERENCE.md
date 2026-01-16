# Email Verification API Reference

## Base URL
```
http://localhost:3000/auth
```

## Authentication
- New endpoints don't require authentication
- JWT token required for `/auth/profile`

## Endpoints

### 1. POST /signup
Register a new user with email verification

**Description:** Creates a new user account in unverified status and sends verification email.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "string (required, min 1 char)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 chars)"
}
```

**Success Response (201 Created):**
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

**Error Responses:**

**400 Bad Request - Validation Error:**
```json
{
  "statusCode": 400,
  "message": "Email should be an email",
  "error": "Bad Request"
}
```

**409 Conflict - Email Exists:**
```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

**500 Internal Server Error - Email Send Failed:**
```json
{
  "statusCode": 500,
  "message": "Failed to send email: SMTP error details",
  "error": "Internal Server Error"
}
```

**Request Examples:**

**cURL:**
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "MyPassword123!"
  }'
```

**JavaScript/Fetch:**
```javascript
const response = await fetch('http://localhost:3000/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'MyPassword123!'
  })
});

const data = await response.json();
console.log(data);
```

**JavaScript/Axios:**
```javascript
const { data } = await axios.post('http://localhost:3000/auth/signup', {
  name: 'Jane Smith',
  email: 'jane@example.com',
  password: 'MyPassword123!'
});

console.log(data);
```

**TypeScript:**
```typescript
interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

interface SignupResponse {
  message: string;
  user: {
    id: string;
    email: string;
    name: string;
    isVerified: boolean;
  };
}

async function signup(data: SignupRequest): Promise<SignupResponse> {
  const response = await fetch('/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return response.json();
}
```

---

### 2. GET /verify-email
Verify email using token from email link

**Description:** Activates a user account by verifying the email token. Typically used when user clicks the verification link from email.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token | string | Yes | Verification token from email link (64-character hex string) |

**Success Response (200 OK):**
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

**Error Responses:**

**400 Bad Request - No Token:**
```json
{
  "statusCode": 400,
  "message": "Verification token is required",
  "error": "Bad Request"
}
```

**400 Bad Request - Invalid Token:**
```json
{
  "statusCode": 400,
  "message": "Invalid or expired verification token",
  "error": "Bad Request"
}
```

**Request Examples:**

**URL Format:**
```
http://localhost:3000/auth/verify-email?token=abc123def456...
```

**cURL:**
```bash
curl -X GET "http://localhost:3000/auth/verify-email?token=abc123def456789..."
```

**JavaScript/Fetch:**
```javascript
const token = new URLSearchParams(window.location.search).get('token');

const response = await fetch(
  `http://localhost:3000/auth/verify-email?token=${token}`
);

const data = await response.json();
console.log(data);
```

**Frontend Integration (React):**
```typescript
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (token) {
      fetch(`/auth/verify-email?token=${token}`)
        .then(res => res.json())
        .then(data => {
          console.log('Verified:', data.message);
          // Redirect to login
        })
        .catch(err => console.error('Verification failed:', err));
    }
  }, [searchParams]);

  return <div>Verifying your email...</div>;
}
```

---

### 3. POST /verify-email
Alternative endpoint to verify email (POST method)

**Description:** Same functionality as GET /verify-email but accepts token in request body.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "string (64-character hex string)"
}
```

**Success Response (200 OK):**
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

**Error Responses:** Same as GET /verify-email

**Request Examples:**

**cURL:**
```bash
curl -X POST http://localhost:3000/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token": "abc123def456789..."}'
```

**JavaScript/Fetch:**
```javascript
const response = await fetch('http://localhost:3000/auth/verify-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: 'abc123def456789...'
  })
});

const data = await response.json();
console.log(data);
```

---

### 4. POST /login
Login with email verification check

**Description:** Authenticates user with email and password. Requires email to be verified first.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "string (required, valid email)",
  "password": "string (required)"
}
```

**Success Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER",
    "isVerified": true
  }
}
```

**Error Responses:**

**401 Unauthorized - Invalid Credentials:**
```json
{
  "statusCode": 401,
  "message": "Invalid email or password",
  "error": "Unauthorized"
}
```

**401 Unauthorized - Email Not Verified:**
```json
{
  "statusCode": 401,
  "message": "Please verify your email before logging in. Check your inbox for the verification link.",
  "error": "Unauthorized"
}
```

**400 Bad Request - Validation Error:**
```json
{
  "statusCode": 400,
  "message": "Email should be an email",
  "error": "Bad Request"
}
```

**Request Examples:**

**cURL:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "MyPassword123!"
  }'
```

**JavaScript/Fetch:**
```javascript
const response = await fetch('http://localhost:3000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'MyPassword123!'
  })
});

const data = await response.json();

if (response.ok) {
  localStorage.setItem('accessToken', data.access_token);
  console.log('Logged in as:', data.user.email);
} else {
  console.error('Login failed:', data.message);
}
```

**TypeScript:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    isVerified: boolean;
  };
}

async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}
```

---

## Common Workflows

### Complete User Registration Flow

```
1. User fills signup form
   ↓
2. POST /auth/signup
   ├─ Create unverified user
   ├─ Generate verification token
   └─ Send email with verification link
   ↓
3. User receives email
   ↓
4. User clicks verification link
   └─ Frontend redirects to /verify-email?token=...
   ↓
5. GET /auth/verify-email?token=...
   ├─ Verify token and expiration
   ├─ Mark user as verified
   └─ Clear token from database
   ↓
6. Show success message
   ↓
7. User clicks "Go to Login"
   ↓
8. POST /auth/login
   ├─ Check email/password
   ├─ Check isVerified flag
   └─ Return JWT token
   ↓
9. User logged in successfully
```

### Error Cases

**Case 1: Email Already Exists**
```
1. POST /auth/signup with existing email
   ↓
2. 409 Conflict - "Email already exists"
   ↓
3. Show error: "Email already registered"
4. Suggest: Use different email or login
```

**Case 2: Expired Verification Token**
```
1. User clicks verification link after 24+ hours
   ↓
2. GET /auth/verify-email?token=expired_token
   ↓
3. 400 Bad Request - "Invalid or expired token"
   ↓
4. Show error: "Verification link expired"
5. Suggest: Sign up again to get new link
```

**Case 3: Unverified User Tries to Login**
```
1. POST /auth/login (email not verified)
   ↓
2. 401 Unauthorized - "Please verify your email before logging in..."
   ↓
3. Show error with verification email instructions
4. Suggest: Check spam folder for email
```

---

## Rate Limiting Considerations

While not implemented in this version, consider adding:

```typescript
// Example: Limit signup to 5 requests per hour per IP
@Post('signup')
@UseGuards(RateLimitGuard)
async signup(@Body() signupDto: SignupDto) { ... }

// Example: Limit login attempts to 5 per 15 minutes per email
@Post('login')
@UseGuards(RateLimitGuard)
async login(@Body() loginDto: LoginDto) { ... }
```

---

## CORS Configuration

If frontend is on different domain:

```typescript
// main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

---

## Security Headers

Recommended headers:

```typescript
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

---

## Token Structure

**Verification Token:**
- Length: 64 characters (32 bytes hex-encoded)
- Generated: Random using `randomBytes(32)`
- Stored: In database, not in JWT
- Expiry: 24 hours from creation

**JWT Token:**
- Payload includes: `sub` (user ID), `email`, `name`, `role`
- Secret: `JWT_SECRET` from environment
- Expiry: 7 days (configured in `JWT_EXPIRES_IN`)

---

## Database Impact

**New Columns in users table:**
- `is_verified` (BOOLEAN, default: false)
- `verification_token` (VARCHAR 500, nullable)
- `verification_token_expires` (TIMESTAMP, nullable)

**New Indexes:**
- `idx_users_verification_token` (for fast token lookup)
- `idx_users_is_verified` (for filtering unverified users)

---

## Monitoring & Logging

**Log Messages:**
```
[AuthService] Email verified successfully for user@example.com
[AuthService] Signup successful for user@example.com. Verification email sent.
[AuthService] User user@example.com logged in successfully
[EmailService] Verification email sent successfully to user@example.com
[EmailService] Welcome email sent successfully to user@example.com
```

**Error Logs:**
```
[EmailService] Failed to send verification email to user@example.com: SMTP error
[AuthService] Failed to send verification email for user@example.com
```

---

## Testing with Tools

### Postman

1. Create Signup request:
   - POST `http://localhost:3000/auth/signup`
   - Body: JSON with name, email, password

2. Create Verify request:
   - GET `http://localhost:3000/auth/verify-email?token={{token}}`

3. Create Login request:
   - POST `http://localhost:3000/auth/login`
   - Body: JSON with email, password

4. Use Postman Tests to automate:
```javascript
// Tests tab
if (pm.response.code === 201) {
  pm.environment.set('verificationToken', pm.response.json().token);
}
```

### Insomnia

Similar workflow as Postman. Create requests and organize in folder:
- Auth/Signup
- Auth/Verify Email
- Auth/Login
- Auth/Profile

---

## Migration Notes

**From old system without verification:**

1. All existing users: `is_verified = true` (assume they were verified in old system)
2. Update migration:
```sql
UPDATE "users" SET "is_verified" = true WHERE "is_verified" IS NULL;
```

3. Or use data migration script:
```typescript
// src/migrations/verify-existing-users.ts
async function verifyExistingUsers() {
  await this.userRepository.update({}, { isVerified: true });
}
```

---

## Backward Compatibility

**Old `/auth/register` endpoint still works** but internally calls new signup flow:

```typescript
async register(data) {
  return this.signup(data); // Now sends verification email
}
```

If you need pure sync registration without email:
- Create new endpoint: `POST /auth/register-sync`
- Use old logic without email sending
- Document as legacy

---

## Next Steps

1. ✅ Test all endpoints with provided examples
2. ✅ Integrate frontend verify page
3. ✅ Set up email service (Gmail/SendGrid/etc)
4. ✅ Configure SMTP in environment
5. ✅ Deploy to staging
6. ✅ Perform user acceptance testing
7. ✅ Deploy to production
8. ✅ Monitor email delivery rates
