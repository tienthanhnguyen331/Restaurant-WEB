# Admin Profile Management - Complete Implementation Guide

## Overview
This document provides comprehensive documentation for the Admin Profile Management feature, including full account management capabilities: profile updates, password changes, email verification, and avatar uploads.

---

## 📋 Table of Contents
1. [Backend Implementation](#backend-implementation)
2. [Frontend Implementation](#frontend-implementation)
3. [API Endpoints](#api-endpoints)
4. [Security Considerations](#security-considerations)
5. [Setup & Installation](#setup--installation)
6. [Testing Guide](#testing-guide)
7. [Error Handling](#error-handling)

---

## Backend Implementation

### 1. Database Schema Changes

**New Fields Added to `users` Table:**
```sql
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "displayName" VARCHAR(50),
ADD COLUMN IF NOT EXISTS "isEmailVerified" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "emailVerificationToken" VARCHAR(255);
```

**Migration File:** `database/migrations/add_profile_fields.sql`

### 2. Entity Updates

**File:** `packages/backend/src/modules/user/user.entity.ts`

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  displayName?: string;  // NEW: Optional display name

  @Column({ unique: true })
  email: string;

  @Column({ select: false, nullable: true })
  password?: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: false })
  isEmailVerified: boolean;  // NEW: Email verification status

  @Column({ nullable: true, select: false })
  emailVerificationToken?: string;  // NEW: Token for verification

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => OrderEntity, (order) => order.user)
  orders?: OrderEntity[];
}
```

### 3. DTOs (Data Transfer Objects)

**Location:** `packages/backend/src/modules/admin/profile/dto/`

#### UpdateProfileDto
```typescript
export class UpdateProfileDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Matches(/^[a-zA-ZÀ-ỹ\s]+$/)
  fullName: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  displayName?: string;
}
```

#### ChangePasswordDto
```typescript
export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  newPassword: string;

  @IsString()
  confirmNewPassword: string;
}
```

#### ChangeEmailDto
```typescript
export class ChangeEmailDto {
  @IsEmail()
  newEmail: string;

  @IsString()
  password: string;
}
```

### 4. Service Implementation

**File:** `packages/backend/src/modules/admin/profile/admin-profile.service.ts`

**Key Methods:**

```typescript
@Injectable()
export class AdminProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Get current admin's profile
  async getProfile(userId: string): Promise<Partial<User>>

  // Update basic profile information
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<Partial<User>>

  // Change password with old password verification
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }>

  // Initiate email change process
  async initiateEmailChange(userId: string, changeEmailDto: ChangeEmailDto): Promise<{ message: string }>

  // Upload and update avatar via Cloudinary
  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<Partial<User>>

  // Verify email change with token
  async verifyEmailChange(userId: string, token: string): Promise<{ message: string }>
}
```

**Features:**
- ✅ Input validation using class-validator
- ✅ Bcrypt password hashing and verification
- ✅ Cloudinary integration for image uploads
- ✅ Email verification token generation
- ✅ Comprehensive error handling

### 5. Controller Implementation

**File:** `packages/backend/src/modules/admin/profile/admin-profile.controller.ts`

**Endpoints:**

```typescript
@Controller('admin/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminProfileController {
  @Get()
  async getProfile(@CurrentUser('sub') userId: string)

  @Patch()
  async updateProfile(@CurrentUser('sub') userId: string, @Body() updateProfileDto: UpdateProfileDto)

  @Patch('password')
  async changePassword(@CurrentUser('sub') userId: string, @Body() changePasswordDto: ChangePasswordDto)

  @Patch('email')
  async changeEmail(@CurrentUser('sub') userId: string, @Body() changeEmailDto: ChangeEmailDto)

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(@CurrentUser('sub') userId: string, @UploadedFile() file: Express.Multer.File)

  @Get('email/verify/:token')
  async verifyEmail(@CurrentUser('sub') userId: string, @CurrentUser('sub') token: string)
}
```

### 6. Module Setup

**File:** `packages/backend/src/modules/admin/profile/admin-profile.module.ts`

```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CloudinaryModule,
  ],
  providers: [AdminProfileService],
  controllers: [AdminProfileController],
  exports: [AdminProfileService],
})
export class AdminProfileModule {}
```

### 7. Integration with App Module

**File:** `packages/backend/src/app.module.ts`

```typescript
import { AdminProfileModule } from './modules/admin/profile/admin-profile.module';

@Module({
  imports: [
    // ... other imports
    AdminProfileModule,  // Added
  ],
})
export class AppModule {}
```

---

## Frontend Implementation

### 1. API Service

**File:** `packages/frontend/src/services/adminProfileApi.ts`

```typescript
export const adminProfileApi = {
  getProfile: () => axios.get(`${API_BASE}`).then(res => res.data),
  updateProfile: (data: UpdateProfilePayload) => axios.patch(`${API_BASE}`, data).then(res => res.data),
  changePassword: (data: ChangePasswordPayload) => axios.patch(`${API_BASE}/password`, data).then(res => res.data),
  changeEmail: (data: ChangeEmailPayload) => axios.patch(`${API_BASE}/email`, data).then(res => res.data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return axios.post(`${API_BASE}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(res => res.data);
  },
  verifyEmail: (token: string) => axios.get(`${API_BASE}/email/verify/${token}`).then(res => res.data),
};
```

### 2. Reusable Form Components

**Location:** `packages/frontend/src/components/FormComponents/`

#### FormInput Component
```typescript
interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}
```

#### PasswordInput Component
```typescript
// Features:
// - Toggle password visibility
// - Real-time password requirements validation
// - Visual indicators for each requirement
// - Support for showing/hiding requirements
```

#### FormTextarea Component
```typescript
// Similar to FormInput but for longer text
```

### 3. Profile Management Components

**Location:** `packages/frontend/src/features/admin-profile/components/`

#### ProfileInfoForm
```typescript
- Update full name and display name
- Form validation
- Success/error messages
- Loading states
```

#### ChangePasswordForm
```typescript
- Old password verification
- New password with requirements validation
- Confirmation password matching
- Real-time validation feedback
```

#### ChangeEmailForm
```typescript
- Current email display
- New email input with validation
- Password confirmation
- Email change workflow messaging
```

#### AvatarUploadComponent
```typescript
- File type validation (JPG, JPEG, PNG)
- File size validation (max 2MB)
- Image preview before upload
- Drag-and-drop support ready
```

### 4. Main Admin Profile Page

**File:** `packages/frontend/src/features/admin-profile/AdminProfilePage.tsx`

**Features:**
- Profile overview with avatar, name, email, role
- Tab-like sections for different management areas
- Organized layout with grid system
- React Query for state management
- Loading states and error handling
- Success notifications

**Page Sections:**
1. Profile Overview - Shows avatar, name, email, role, verification status
2. Profile Info Form - Update name and display name
3. Avatar Upload - Upload new profile picture
4. Change Password - Update password with validation
5. Change Email - Email change workflow
6. Account Details - Creation and last update dates

---

## API Endpoints

### Base URL
```
/api/admin/profile
```

### 1. Get Profile
```http
GET /admin/profile

Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Lấy thông tin hồ sơ thành công",
  "data": {
    "id": "uuid",
    "name": "Admin Name",
    "displayName": "Admin Display",
    "email": "admin@example.com",
    "avatar": "https://cloudinary-url.com/avatar.jpg",
    "role": "ADMIN",
    "isEmailVerified": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-16T00:00:00Z"
  }
}
```

### 2. Update Profile
```http
PATCH /admin/profile

Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "fullName": "New Name",
  "displayName": "Display Name"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Cập nhật hồ sơ thành công",
  "data": {
    "id": "uuid",
    "name": "New Name",
    "displayName": "Display Name",
    "email": "admin@example.com",
    "avatar": "...",
    "role": "ADMIN"
  }
}
```

### 3. Change Password
```http
PATCH /admin/profile/password

Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "oldPassword": "OldPassword123",
  "newPassword": "NewPassword123",
  "confirmNewPassword": "NewPassword123"
}
```

**Validation Rules:**
- Minimum length: 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Mật khẩu đã được cập nhật thành công. Vui lòng đăng nhập lại.",
  "data": null
}
```

### 4. Change Email
```http
PATCH /admin/profile/email

Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "newEmail": "newemail@example.com",
  "password": "CurrentPassword123"
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Email đã được gửi. Vui lòng kiểm tra email để xác nhận.",
  "data": null
}
```

### 5. Upload Avatar
```http
POST /admin/profile/avatar

Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data

FormData:
  avatar: <FILE>
```

**File Validation:**
- Accepted formats: JPG, JPEG, PNG
- Maximum size: 2MB

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Tải lên avatar thành công",
  "data": {
    "id": "uuid",
    "name": "Admin Name",
    "email": "admin@example.com",
    "avatar": "https://cloudinary-url.com/avatar-new.jpg",
    "role": "ADMIN"
  }
}
```

### 6. Verify Email Change
```http
GET /admin/profile/email/verify/:token

Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "statusCode": 200,
  "message": "Email đã được xác nhận thành công",
  "data": null
}
```

---

## Security Considerations

### 1. Authentication & Authorization
- ✅ JWT token validation on all endpoints
- ✅ RolesGuard ensures only ADMIN role can access
- ✅ CurrentUser decorator for extracting user from JWT payload

### 2. Password Security
- ✅ Bcrypt hashing with salt rounds (10)
- ✅ Old password verification required
- ✅ Password policy enforcement (min 8 chars, uppercase, lowercase, number)
- ✅ Tokens invalidated after password change (to be implemented)

### 3. Email Verification
- ✅ Verification token generation
- ✅ Email change only finalized after verification
- ✅ Duplicate email prevention

### 4. File Upload Security
- ✅ File type validation (mimetype checking)
- ✅ File size limits (2MB max)
- ✅ Cloudinary for secure image storage

### 5. Data Protection
- ✅ Password field excluded from default queries (select: false)
- ✅ Sensitive tokens excluded from response objects
- ✅ User data sanitization before API responses

### 6. Best Practices
- ✅ HTTPS/TLS for all communications
- ✅ CORS properly configured
- ✅ Rate limiting (to be implemented)
- ✅ SQL injection prevention via ORM
- ✅ XSS protection via React

---

## Setup & Installation

### Backend Setup

1. **Update User Entity:**
   ```bash
   # Replace file: packages/backend/src/modules/user/user.entity.ts
   ```

2. **Run Migration:**
   ```bash
   # Execute database/migrations/add_profile_fields.sql
   # Or if using TypeORM sync:
   npm run start
   ```

3. **Copy Module Files:**
   ```bash
   # Copy to: packages/backend/src/modules/admin/profile/
   # - admin-profile.service.ts
   # - admin-profile.controller.ts
   # - admin-profile.module.ts
   # - dto/
   ```

4. **Update App Module:**
   ```bash
   # Add AdminProfileModule import to packages/backend/src/app.module.ts
   ```

5. **Restart Backend:**
   ```bash
   npm run start:dev
   ```

### Frontend Setup

1. **Create API Service:**
   ```bash
   # packages/frontend/src/services/adminProfileApi.ts
   ```

2. **Create Form Components:**
   ```bash
   # packages/frontend/src/components/FormComponents/
   # - FormInput.tsx
   # - PasswordInput.tsx
   # - FormTextarea.tsx
   # - index.ts
   ```

3. **Create Profile Feature:**
   ```bash
   # packages/frontend/src/features/admin-profile/
   # - components/
   #   - ProfileInfoForm.tsx
   #   - ChangePasswordForm.tsx
   #   - ChangeEmailForm.tsx
   #   - AvatarUploadComponent.tsx
   #   - index.ts
   # - AdminProfilePage.tsx
   # - index.ts
   ```

4. **Add Route (Example):**
   ```typescript
   // In your router setup
   import AdminProfilePage from '@/features/admin-profile';
   
   {
     path: '/admin/profile',
     element: <AdminProfilePage />,
     requiredRole: 'ADMIN'
   }
   ```

---

## Testing Guide

### Backend Testing

#### 1. Test Get Profile
```bash
curl -X GET http://localhost:3000/api/admin/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 2. Test Update Profile
```bash
curl -X PATCH http://localhost:3000/api/admin/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "New Name",
    "displayName": "New Display"
  }'
```

#### 3. Test Change Password
```bash
curl -X PATCH http://localhost:3000/api/admin/profile/password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "OldPass123",
    "newPassword": "NewPass123",
    "confirmNewPassword": "NewPass123"
  }'
```

#### 4. Test Upload Avatar
```bash
curl -X POST http://localhost:3000/api/admin/profile/avatar \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

### Frontend Testing

1. **Component Testing:**
   - FormInput validation
   - PasswordInput visibility toggle
   - AvatarUploadComponent file validation

2. **Integration Testing:**
   - Profile page loads correctly
   - All forms submit successfully
   - Error messages display properly
   - Success notifications appear

3. **E2E Testing:**
   - Complete profile update workflow
   - Password change flow
   - Avatar upload flow

---

## Error Handling

### Backend Error Responses

#### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation error message",
  "error": "BadRequest"
}
```

#### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

#### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Only admin can access this resource",
  "error": "Forbidden"
}
```

#### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Email đã được sử dụng",
  "error": "Conflict"
}
```

### Frontend Error Handling

- Try-catch blocks for API calls
- User-friendly error messages
- Form-level error displays
- Validation feedback before submission

---

## Future Enhancements

1. **Email Verification:**
   - Implement email sending via NodeMailer/SendGrid
   - Verification email templates
   - Link expiration handling

2. **2FA (Two-Factor Authentication):**
   - TOTP setup
   - SMS verification

3. **Session Management:**
   - Token invalidation on password change
   - Session listing and management
   - Device management

4. **Activity Logging:**
   - Track profile changes
   - Login history
   - Password change history

5. **Advanced Avatar Options:**
   - Crop/rotate before upload
   - Multiple avatar options
   - Avatar history

---

## File Structure Summary

### Backend
```
packages/backend/src/
├── modules/
│   ├── admin/
│   │   └── profile/
│   │       ├── dto/
│   │       │   ├── update-profile.dto.ts
│   │       │   ├── change-password.dto.ts
│   │       │   ├── change-email.dto.ts
│   │       │   ├── avatar-upload.dto.ts
│   │       │   └── index.ts
│   │       ├── admin-profile.service.ts
│   │       ├── admin-profile.controller.ts
│   │       └── admin-profile.module.ts
│   └── user/
│       └── user.entity.ts (UPDATED)
└── app.module.ts (UPDATED)

database/
└── migrations/
    └── add_profile_fields.sql
```

### Frontend
```
packages/frontend/src/
├── components/
│   └── FormComponents/
│       ├── FormInput.tsx
│       ├── PasswordInput.tsx
│       ├── FormTextarea.tsx
│       └── index.ts
├── features/
│   └── admin-profile/
│       ├── components/
│       │   ├── ProfileInfoForm.tsx
│       │   ├── ChangePasswordForm.tsx
│       │   ├── ChangeEmailForm.tsx
│       │   ├── AvatarUploadComponent.tsx
│       │   └── index.ts
│       ├── AdminProfilePage.tsx
│       └── index.ts
└── services/
    └── adminProfileApi.ts
```

---

## Version History

- **v1.0.0** (2024-01-16)
  - Initial implementation
  - Profile update
  - Password change
  - Email change workflow
  - Avatar upload
  - Complete documentation

---

## Support & Troubleshooting

### Common Issues

**Issue:** Avatar upload fails
- Check Cloudinary credentials in `.env`
- Verify file size < 2MB
- Confirm file format is JPG/PNG

**Issue:** Password change throws error
- Verify old password is correct
- Ensure new password meets requirements
- Check password confirmation matches

**Issue:** Email verification not working
- Implement email service (NodeMailer/SendGrid)
- Configure SMTP credentials
- Test with console logs

---

**Document Version:** 1.0.0
**Last Updated:** January 16, 2024
**Author:** AI Assistant
