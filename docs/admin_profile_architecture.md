# Admin Profile Management - Architecture & Technical Design

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        RESTAURANT WEB APP                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐              ┌──────────────────────┐  │
│  │   FRONTEND (React)  │              │  BACKEND (NestJS)    │  │
│  ├─────────────────────┤              ├──────────────────────┤  │
│  │                     │              │                      │  │
│  │ AdminProfilePage    │◄─ REST API ─►│ AdminProfileCtrl     │  │
│  │   ├─ Components     │  (HTTP)      │                      │  │
│  │   │ - Profile       │              │ AdminProfileService  │  │
│  │   │ - Password      │              │ ├─ updateProfile     │  │
│  │   │ - Email         │              │ ├─ changePassword    │  │
│  │   │ - Avatar        │              │ ├─ changeEmail       │  │
│  │   └─ Forms          │              │ └─ uploadAvatar      │  │
│  │                     │              │                      │  │
│  │ adminProfileApi     │              │ UserRepository       │  │
│  │ (Service Layer)     │              │                      │  │
│  │                     │              │                      │  │
│  └─────────────────────┘              └──────────────────────┘  │
│                                                │                 │
│                                                ▼                 │
│                                      ┌──────────────────────┐   │
│                                      │  PostgreSQL Database │   │
│                                      │  ├─ users table      │   │
│                                      │  │ ├─ id             │   │
│                                      │  │ ├─ name           │   │
│                                      │  │ ├─ displayName*   │   │
│                                      │  │ ├─ email          │   │
│                                      │  │ ├─ password       │   │
│                                      │  │ ├─ avatar         │   │
│                                      │  │ ├─ isEmailVerified*
│                                      │  │ ├─ emailVerTok*   │   │
│                                      │  │ ├─ role           │   │
│                                      │  │ └─ timestamps     │   │
│                                      │  └─ orders...        │   │
│                                      └──────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────┐  ┌────────────────────┐   │
│  │     External Services            │  │  Authentication    │   │
│  ├──────────────────────────────────┤  ├────────────────────┤   │
│  │                                  │  │                    │   │
│  │ Cloudinary (Image Storage)       │  │ JWT Tokens         │   │
│  │ ├─ Upload endpoint               │  │ RolesGuard         │   │
│  │ ├─ URL storage                   │  │ JwtAuthGuard       │   │
│  │ └─ Folder management             │  │                    │   │
│  │                                  │  │                    │   │
│  │ NodeMailer/SendGrid (Email)      │  │                    │   │
│  │ ├─ Email verification            │  │                    │   │
│  │ ├─ Password reset                │  │                    │   │
│  │ └─ Notifications                 │  │                    │   │
│  │                                  │  │                    │   │
│  └──────────────────────────────────┘  └────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

* = New fields added in this implementation
```

---

## Data Flow Diagram

### 1. Profile Update Flow
```
User Interface (React)
    ↓
    └─→ ProfileInfoForm Component
            ↓
            ├─ Validates input (client-side)
            ├─ Shows error messages
            └─→ adminProfileApi.updateProfile()
                    ↓
                    └─→ HTTP PATCH /admin/profile
                            ↓
                            └─→ Backend Receives Request
                                    ↓
                                    ├─ JwtAuthGuard validates token
                                    ├─ RolesGuard checks ADMIN role
                                    └─→ AdminProfileController.updateProfile()
                                            ↓
                                            └─→ AdminProfileService.updateProfile()
                                                    ↓
                                                    ├─ Validates DTO
                                                    ├─ Fetches user from DB
                                                    ├─ Updates fields
                                                    └─→ Saves to database
                                                            ↓
                                                            └─→ Returns updated profile
                                                                    ↓
                                                    Sends success response
                                                            ↓
                    Response received by frontend
                            ↓
                    ├─ Update local state
                    ├─ Show success message
                    ├─ Update UI
                    └─ React Query cache update
```

### 2. Password Change Flow
```
User Interface (React)
    ↓
    └─→ ChangePasswordForm Component
            ↓
            ├─ Real-time validation
            ├─ Requirements indicator
            └─→ adminProfileApi.changePassword()
                    ↓
                    └─→ HTTP PATCH /admin/profile/password
                            ↓
                            └─→ Backend Receives Request
                                    ↓
                                    ├─ JwtAuthGuard validates token
                                    ├─ RolesGuard checks ADMIN role
                                    └─→ AdminProfileController.changePassword()
                                            ↓
                                            └─→ AdminProfileService.changePassword()
                                                    ↓
                                                    ├─ Validates DTO
                                                    ├─ Fetches user with password
                                                    ├─ Verifies old password (bcrypt)
                                                    ├─ Hashes new password
                                                    └─→ Saves to database
                                                            ↓
                                                    TODO: Invalidate tokens
                                                            ↓
                                                    Returns success message
                                                            ↓
                    Response received by frontend
                            ↓
                    ├─ Show success message
                    ├─ Redirect to login
                    └─ Clear local session
```

### 3. Email Change Flow
```
User Interface (React)
    ↓
    └─→ ChangeEmailForm Component
            ↓
            ├─ Validates email format
            ├─ Shows current email
            └─→ adminProfileApi.changeEmail()
                    ↓
                    └─→ HTTP PATCH /admin/profile/email
                            ↓
                            └─→ Backend Receives Request
                                    ↓
                                    ├─ JwtAuthGuard validates token
                                    ├─ RolesGuard checks ADMIN role
                                    └─→ AdminProfileController.changeEmail()
                                            ↓
                                            └─→ AdminProfileService.initiateEmailChange()
                                                    ↓
                                                    ├─ Validates DTO
                                                    ├─ Verifies password
                                                    ├─ Checks duplicate emails
                                                    ├─ Generates verification token
                                                    ├─ Stores token in DB
                                                    └─→ TODO: Send verification email
                                                            ↓
                                                    Returns success message
                                                            ↓
                    Response received by frontend
                            ↓
                    ├─ Show "Check your email" message
                    └─ Await user verification via link
                            ↓
                    User clicks verification link
                            ↓
                    └─→ adminProfileApi.verifyEmail(token)
                            ↓
                            └─→ HTTP GET /admin/profile/email/verify/:token
                                    ↓
                                    └─→ AdminProfileService.verifyEmailChange()
                                            ↓
                                            ├─ Validates token
                                            ├─ Updates isEmailVerified = true
                                            ├─ Clears token
                                            └─→ Saves to database
                                                    ↓
                                                    Returns success
                                                            ↓
                            ├─ Update state
                            ├─ Show email verified message
                            └─ Update UI
```

### 4. Avatar Upload Flow
```
User Interface (React)
    ↓
    └─→ AvatarUploadComponent
            ↓
            ├─ File selection
            ├─ Validates type (JPG, JPEG, PNG)
            ├─ Validates size (< 2MB)
            ├─ Shows preview
            └─→ adminProfileApi.uploadAvatar(file)
                    ↓
                    └─→ HTTP POST /admin/profile/avatar
                        (multipart/form-data)
                            ↓
                            └─→ Backend Receives Request
                                    ↓
                                    ├─ JwtAuthGuard validates token
                                    ├─ RolesGuard checks ADMIN role
                                    ├─ FileInterceptor extracts file
                                    └─→ AdminProfileController.uploadAvatar()
                                            ↓
                                            └─→ AdminProfileService.uploadAvatar()
                                                    ↓
                                                    ├─ Validates file (type, size)
                                                    ├─ Fetches user from DB
                                                    └─→ CloudinaryService.uploadFile()
                                                            ↓
                                                            ├─ Uploads to Cloudinary
                                                            └─→ Returns secure_url
                                                                    ↓
                                                    Updates user.avatar
                                                            ↓
                                                    Saves to database
                                                            ↓
                                                    Returns updated profile
                                                            ↓
                    Response received by frontend
                            ↓
                    ├─ Update avatar preview
                    ├─ Show success message
                    ├─ Update UI
                    └─ React Query cache update
```

---

## Component Hierarchy

```
AdminProfilePage (Main Container)
│
├─ ProfileOverview (Header)
│  ├─ Avatar display
│  ├─ Name and email
│  ├─ Role badge
│  └─ Email verification status
│
├─ Grid Layout (2 columns)
│  │
│  ├─ Column 1
│  │  ├─ ProfileInfoForm
│  │  │  ├─ FormInput (fullName)
│  │  │  ├─ FormInput (displayName)
│  │  │  └─ Submit button
│  │  │
│  │  └─ ChangePasswordForm
│  │     ├─ PasswordInput (oldPassword)
│  │     ├─ PasswordInput (newPassword)
│  │     │  ├─ Requirements indicator
│  │     │  └─ Show/hide toggle
│  │     ├─ PasswordInput (confirmNewPassword)
│  │     └─ Submit button
│  │
│  └─ Column 2
│     ├─ AvatarUploadComponent
│     │  ├─ Avatar preview
│     │  ├─ File input
│     │  ├─ File validation
│     │  └─ Upload button
│     │
│     └─ ChangeEmailForm
│        ├─ Info box (current email)
│        ├─ FormInput (newEmail)
│        ├─ PasswordInput (password)
│        └─ Submit button
│
└─ Footer
   ├─ Account creation date
   └─ Last update date
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    REQUEST FLOW                          │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Client (Frontend)                                      │
│    │                                                     │
│    └─→ HTTP Request with JWT Token                     │
│           └─ Authorization: Bearer <JWT_TOKEN>          │
│                  │                                        │
│                  ▼                                        │
│  ┌──────────────────────────────────────────┐           │
│  │ JwtAuthGuard                             │           │
│  ├──────────────────────────────────────────┤           │
│  │ 1. Extract token from header             │           │
│  │ 2. Validate signature                    │           │
│  │ 3. Check expiration                      │           │
│  │ 4. Verify sub (user ID)                  │           │
│  │ 5. Attach payload to request             │           │
│  │ ✓ Pass or ✗ Reject (401)                │           │
│  └──────────────────────────────────────────┘           │
│                  │                                        │
│                  ▼                                        │
│  ┌──────────────────────────────────────────┐           │
│  │ RolesGuard                               │           │
│  ├──────────────────────────────────────────┤           │
│  │ 1. Read @Roles decorator                 │           │
│  │ 2. Extract user.role from request        │           │
│  │ 3. Check if role is allowed              │           │
│  │ 4. Compare with required roles           │           │
│  │ ✓ Pass or ✗ Reject (403)                │           │
│  └──────────────────────────────────────────┘           │
│                  │                                        │
│                  ▼                                        │
│  ┌──────────────────────────────────────────┐           │
│  │ AdminProfileController                  │           │
│  ├──────────────────────────────────────────┤           │
│  │ @Controller('admin/profile')             │           │
│  │ @UseGuards(JwtAuthGuard, RolesGuard)    │           │
│  │ @Roles(UserRole.ADMIN)                   │           │
│  │                                          │           │
│  │ Request reached ✓                        │           │
│  └──────────────────────────────────────────┘           │
│                  │                                        │
│                  ▼                                        │
│  AdminProfileService (Business Logic)                  │
│    ├─ Data validation                                   │
│    ├─ Password verification (bcrypt)                    │
│    ├─ Duplicate checking                                │
│    ├─ File validation                                   │
│    └─ Database operations                               │
│                  │                                        │
│                  ▼                                        │
│  Database (TypeORM + PostgreSQL)                       │
│    └─ Sanitized queries (prevent SQL injection)        │
│                                                           │
└─────────────────────────────────────────────────────────┘

Security Layers:
  1. Transport: HTTPS/TLS (production)
  2. Authentication: JWT signature verification
  3. Authorization: Role-based access control
  4. Validation: Input validation (class-validator)
  5. Storage: Bcrypt password hashing
  6. Query: ORM prevents SQL injection
  7. Response: Sensitive data excluded
```

---

## Database Schema

```
users table:
┌─────────────────────────────────────────────────────┐
│ Column                 │ Type        │ Constraints │
├─────────────────────────────────────────────────────┤
│ id                     │ UUID        │ PRIMARY KEY │
│ name *                 │ VARCHAR     │ NOT NULL    │
│ displayName *          │ VARCHAR(50) │ NULLABLE    │
│ email                  │ VARCHAR     │ UNIQUE      │
│ password               │ VARCHAR     │ NULLABLE    │
│ role                   │ ENUM        │ DEFAULT     │
│ avatar                 │ TEXT        │ NULLABLE    │
│ isEmailVerified *      │ BOOLEAN     │ DEFAULT 0   │
│ emailVerificationToken*│ VARCHAR(255)│ NULLABLE    │
│ created_at             │ TIMESTAMP   │ AUTO        │
│ updated_at             │ TIMESTAMP   │ AUTO        │
│ orders (FK)            │ RELATION    │             │
└─────────────────────────────────────────────────────┘

* = New fields added in this implementation

Indexes:
  - PRIMARY KEY: id
  - UNIQUE: email
  - INDEX: emailVerificationToken (for verification lookups)

Relationships:
  - users.id ← orders.user_id (ONE TO MANY)
```

---

## State Management Flow (React Query)

```
┌────────────────────────────────────────────────────┐
│         React Query State Management               │
├────────────────────────────────────────────────────┤
│                                                     │
│  useQuery('admin-profile')                        │
│    ├─ Status: idle | loading | error | success  │
│    ├─ Data: User profile object                  │
│    ├─ Error: Error object if failed              │
│    ├─ isLoading: boolean                         │
│    └─ Auto-refetch on interval/window focus      │
│                                                     │
│  useMutation(updateProfile)                      │
│    ├─ Status: idle | pending | error | success  │
│    ├─ mutate() - Trigger mutation                │
│    ├─ mutateAsync() - Promise-based              │
│    ├─ isPending: boolean                         │
│    ├─ isError: boolean                           │
│    └─ onSuccess/onError callbacks                │
│                                                     │
│  Cache Management:                                │
│    ├─ Automatic cache invalidation               │
│    ├─ Stale time configuration                   │
│    ├─ Manual cache updates                       │
│    └─ Optimistic updates possible                │
│                                                     │
│  Error Handling:                                   │
│    ├─ Automatic retry on failure                 │
│    ├─ Exponential backoff                        │
│    ├─ Error display in UI                        │
│    └─ User notifications                         │
│                                                     │
└────────────────────────────────────────────────────┘
```

---

## Form Validation Architecture

```
┌────────────────────────────────────────────────────┐
│           Form Validation Flow                      │
├────────────────────────────────────────────────────┤
│                                                     │
│  Client-Side (React Component):                   │
│    1. handleChange() updates local state          │
│    2. validateForm() checks constraints           │
│       ├─ Required field check                     │
│       ├─ Length validation                        │
│       ├─ Pattern matching (regex)                 │
│       ├─ Email format validation                  │
│       ├─ Password requirements                    │
│       ├─ File type/size validation                │
│       └─ Duplicate prevention                     │
│    3. Display error messages inline               │
│    4. Disable submit if invalid                   │
│    5. handleSubmit() sends valid data             │
│                                                     │
│                ↓                                    │
│                                                     │
│  Server-Side (NestJS DTO):                       │
│    1. Receives request with data                  │
│    2. ClassValidator validates DTO               │
│       ├─ @IsString(), @IsEmail()                 │
│       ├─ @MinLength(), @MaxLength()              │
│       ├─ @Matches() regex patterns               │
│       ├─ Custom validators                       │
│       └─ Composite validation                     │
│    3. If invalid: return 400 Bad Request         │
│       ├─ Error details                           │
│       ├─ Field names                             │
│       └─ Validation messages                     │
│    4. If valid: proceed to business logic        │
│    5. Business logic validation                  │
│       ├─ Database constraints                    │
│       ├─ Duplicate email check                   │
│       ├─ Password verification                   │
│       └─ Authorization checks                    │
│                                                     │
│  Error Response (400):                            │
│    {                                              │
│      statusCode: 400,                            │
│      message: "Validation failed",               │
│      errors: [{                                   │
│        field: "email",                           │
│        message: "Invalid email format"           │
│      }]                                          │
│    }                                              │
│                                                     │
└────────────────────────────────────────────────────┘
```

---

## Performance Optimization Strategy

```
┌──────────────────────────────────────────────┐
│    Performance Optimization Points            │
├──────────────────────────────────────────────┤
│                                               │
│ Frontend Optimizations:                      │
│  ├─ React Query caching                      │
│  ├─ Lazy loading components                  │
│  ├─ Memoization for expensive renders        │
│  ├─ Image optimization (Cloudinary)          │
│  ├─ Bundle size optimization                 │
│  └─ Code splitting                           │
│                                               │
│ Backend Optimizations:                       │
│  ├─ Database query optimization              │
│  │  ├─ Select specific fields                │
│  │  ├─ Use indexes                           │
│  │  └─ Avoid N+1 queries                     │
│  ├─ Password hashing async                   │
│  ├─ File upload async processing             │
│  ├─ Connection pooling                       │
│  └─ Caching strategies                       │
│                                               │
│ API Optimization:                            │
│  ├─ Gzip compression                         │
│  ├─ HTTP caching headers                     │
│  ├─ Rate limiting                            │
│  ├─ Request debouncing                       │
│  └─ Response pagination (if needed)          │
│                                               │
└──────────────────────────────────────────────┘
```

---

## Error Handling Strategy

```
┌─────────────────────────────────────────────────┐
│     Error Handling Architecture                  │
├─────────────────────────────────────────────────┤
│                                                   │
│  Backend Error Handling:                        │
│    try {                                        │
│      └─ Execute business logic                 │
│    } catch (error) {                           │
│      ├─ BadRequestException (400)              │
│      ├─ UnauthorizedException (401)            │
│      ├─ ForbiddenException (403)               │
│      ├─ ConflictException (409)                │
│      ├─ InternalServerException (500)          │
│      └─ Custom error messages                  │
│    }                                            │
│                                                   │
│  Frontend Error Handling:                       │
│    try {                                        │
│      └─ Call API endpoint                      │
│    } catch (error) {                           │
│      ├─ Extract error message                  │
│      ├─ Display to user                        │
│      ├─ Log for debugging                      │
│      └─ Reset form state                       │
│    } finally {                                 │
│      └─ Stop loading indicator                │
│    }                                            │
│                                                   │
│  User Feedback:                                │
│    ├─ Error toast/alert                        │
│    ├─ Field-level error messages               │
│    ├─ Form submission blocked                  │
│    ├─ Retry mechanism                          │
│    └─ Help/support links                       │
│                                                   │
└─────────────────────────────────────────────────┘
```

---

**Document Version:** 1.0.0
**Created:** January 16, 2024
**Complexity Level:** Intermediate to Advanced
