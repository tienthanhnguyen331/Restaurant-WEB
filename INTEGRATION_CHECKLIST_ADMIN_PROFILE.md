# Admin Profile Integration Checklist

## Pre-Integration Requirements

- [ ] Node.js environment properly configured
- [ ] Backend running on `http://localhost:3000` (or configured URL)
- [ ] Frontend running on `http://localhost:5173` (or configured URL)
- [ ] PostgreSQL database connected
- [ ] Cloudinary account configured with API credentials
- [ ] JWT secret configured in `.env`

---

## Backend Integration Steps

### Step 1: Database Migration
- [ ] Execute SQL migration: `database/migrations/add_profile_fields.sql`
  ```bash
  psql -U username -d database_name -f database/migrations/add_profile_fields.sql
  ```
- [ ] OR use TypeORM sync if enabled
- [ ] Verify new columns exist:
  ```sql
  SELECT column_name FROM information_schema.columns WHERE table_name='users';
  ```

### Step 2: Update User Entity
- [ ] Copy new User entity fields:
  ```typescript
  displayName?: string
  isEmailVerified: boolean
  emailVerificationToken?: string
  ```
- [ ] Verify no compilation errors: `npm run build`

### Step 3: Create Admin Profile Module
- [ ] Create directory: `packages/backend/src/modules/admin/profile/`
- [ ] Create DTOs directory: `packages/backend/src/modules/admin/profile/dto/`
- [ ] Add files:
  - [ ] `update-profile.dto.ts`
  - [ ] `change-password.dto.ts`
  - [ ] `change-email.dto.ts`
  - [ ] `avatar-upload.dto.ts`
  - [ ] `index.ts` (exports)

### Step 4: Implement Service
- [ ] Create `admin-profile.service.ts`
- [ ] Verify all methods are implemented:
  - [ ] `getProfile()`
  - [ ] `updateProfile()`
  - [ ] `changePassword()`
  - [ ] `initiateEmailChange()`
  - [ ] `uploadAvatar()`
  - [ ] `verifyEmailChange()`
- [ ] Test for compilation errors: `npm run build`

### Step 5: Implement Controller
- [ ] Create `admin-profile.controller.ts`
- [ ] Verify all endpoints:
  - [ ] GET `/admin/profile`
  - [ ] PATCH `/admin/profile`
  - [ ] PATCH `/admin/profile/password`
  - [ ] PATCH `/admin/profile/email`
  - [ ] POST `/admin/profile/avatar`
  - [ ] GET `/admin/profile/email/verify/:token`
- [ ] Ensure decorators are correct:
  - [ ] `@UseGuards(JwtAuthGuard, RolesGuard)`
  - [ ] `@Roles(UserRole.ADMIN)`
  - [ ] `@CurrentUser('sub')`

### Step 6: Create Module
- [ ] Create `admin-profile.module.ts`
- [ ] Import required modules:
  - [ ] `TypeOrmModule.forFeature([User])`
  - [ ] `CloudinaryModule`
- [ ] Export service if needed

### Step 7: Register Module in App
- [ ] Edit `packages/backend/src/app.module.ts`
- [ ] Import: `import { AdminProfileModule } from './modules/admin/profile/admin-profile.module';`
- [ ] Add to imports array: `AdminProfileModule`
- [ ] Verify no circular dependencies

### Step 8: Test Backend Endpoints
- [ ] Start backend: `npm run start:dev`
- [ ] Test each endpoint with Bearer token in Postman/cURL:
  ```bash
  curl -X GET http://localhost:3000/api/admin/profile \
    -H "Authorization: Bearer YOUR_JWT_TOKEN"
  ```
- [ ] Verify responses match API documentation

---

## Frontend Integration Steps

### Step 1: Create API Service
- [ ] Create `packages/frontend/src/services/adminProfileApi.ts`
- [ ] Implement all API methods:
  - [ ] `getProfile()`
  - [ ] `updateProfile()`
  - [ ] `changePassword()`
  - [ ] `changeEmail()`
  - [ ] `uploadAvatar()`
  - [ ] `verifyEmail()`
- [ ] Test for TypeScript errors: `npm run build`

### Step 2: Create Form Components
- [ ] Create directory: `packages/frontend/src/components/FormComponents/`
- [ ] Create components:
  - [ ] `FormInput.tsx`
    - [ ] Props: label, name, type, value, onChange, error, etc.
    - [ ] Styling: Tailwind CSS
    - [ ] Error display
  - [ ] `PasswordInput.tsx`
    - [ ] Show/hide toggle
    - [ ] Requirements indicator
  - [ ] `FormTextarea.tsx`
- [ ] Create `index.ts` for exports

### Step 3: Create Profile Feature
- [ ] Create directory: `packages/frontend/src/features/admin-profile/`
- [ ] Create components directory: `components/`
- [ ] Create component files:
  - [ ] `ProfileInfoForm.tsx`
  - [ ] `ChangePasswordForm.tsx`
  - [ ] `ChangeEmailForm.tsx`
  - [ ] `AvatarUploadComponent.tsx`
  - [ ] `index.ts`

### Step 4: Create Main Profile Page
- [ ] Create `AdminProfilePage.tsx`
- [ ] Implement:
  - [ ] Profile header with avatar
  - [ ] All form components
  - [ ] React Query integration
  - [ ] Loading/error states
  - [ ] Success notifications
- [ ] Create `index.ts` for export

### Step 5: Setup Routing
- [ ] Find your routing configuration (likely in `src/App.tsx` or routes file)
- [ ] Add route:
  ```typescript
  import AdminProfilePage from '@/features/admin-profile';
  
  // In your routes array:
  {
    path: '/admin/profile',
    element: <AdminProfilePage />,
    // Add role protection if needed
  }
  ```
- [ ] Add navigation link:
  ```typescript
  <Link to="/admin/profile">Profile Settings</Link>
  ```

### Step 6: Add to Admin Layout/Navigation
- [ ] Find admin layout file (likely `AdminLayout.tsx`)
- [ ] Add profile link to navigation menu:
  ```typescript
  <NavItem href="/admin/profile" icon="⚙️">
    Profile Settings
  </NavItem>
  ```
- [ ] Or add to user dropdown menu

### Step 7: Test Frontend
- [ ] Start frontend: `npm run dev`
- [ ] Navigate to `/admin/profile`
- [ ] Test all features:
  - [ ] Load profile data
  - [ ] Update profile info
  - [ ] Upload avatar
  - [ ] Change password
  - [ ] Change email
  - [ ] Error handling
  - [ ] Success notifications

---

## Environment Configuration

### Backend `.env` Requirements
```bash
# Cloudinary Configuration (Required for avatar upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=restaurant_db
```

### Frontend `.env` Requirements
```bash
# Backend URL
VITE_BACKEND_URL=http://localhost:3000
# or for production
VITE_BACKEND_URL=https://your-api-domain.com
```

---

## Verification Checklist

### Backend
- [ ] All DTOs created with proper validators
- [ ] Service implements all methods correctly
- [ ] Controller has all endpoints with correct guards
- [ ] Module registered in app.module.ts
- [ ] No TypeScript compilation errors
- [ ] JWT token properly extracted from Authorization header
- [ ] Role guard restricts to ADMIN users
- [ ] Password validation enforces policy
- [ ] File upload validates type and size
- [ ] Error responses use correct HTTP status codes

### Frontend
- [ ] API service makes correct HTTP calls
- [ ] Form components handle validation
- [ ] Main profile page loads successfully
- [ ] All forms submit without errors
- [ ] Loading states display correctly
- [ ] Success/error messages show properly
- [ ] Avatar upload functionality works
- [ ] React Query integration is correct
- [ ] No console warnings/errors
- [ ] Responsive design works on mobile

---

## Troubleshooting Integration Issues

### Issue: "Module not found" error
**Solution:**
- [ ] Check file paths match exact directory structure
- [ ] Verify imports use correct relative paths
- [ ] Run `npm install` if needed
- [ ] Clear node_modules and reinstall if necessary

### Issue: TypeScript compilation errors
**Solution:**
- [ ] Run `npm run build` to see full errors
- [ ] Check for missing type definitions
- [ ] Verify all imports are correct
- [ ] Run `npm install --save-dev @types/express` if needed

### Issue: API returns 401 Unauthorized
**Solution:**
- [ ] Check JWT token is being sent correctly
- [ ] Verify token is not expired
- [ ] Ensure authorization header format is "Bearer TOKEN"
- [ ] Check JWT secret matches between frontend and backend

### Issue: API returns 403 Forbidden
**Solution:**
- [ ] Check user role is ADMIN in database
- [ ] Verify RolesGuard is working correctly
- [ ] Check JWT payload includes role
- [ ] Verify `@Roles(UserRole.ADMIN)` decorator is applied

### Issue: Avatar upload fails
**Solution:**
- [ ] Check Cloudinary credentials in `.env`
- [ ] Verify file is JPG, JPEG, or PNG
- [ ] Check file size is less than 2MB
- [ ] Ensure multipart/form-data is used
- [ ] Check FormData is constructed correctly

### Issue: Password change doesn't work
**Solution:**
- [ ] Verify old password is selected in query
- [ ] Check bcrypt comparison is working
- [ ] Ensure new password meets requirements
- [ ] Check confirmNewPassword matches newPassword
- [ ] Verify database is being updated

---

## Security Verification

- [ ] All endpoints protected by JwtAuthGuard
- [ ] ADMIN role verification enabled
- [ ] Password is hashed with bcrypt
- [ ] Old password verified before changing
- [ ] Email validation prevents duplicates
- [ ] File upload validates type and size
- [ ] Sensitive fields excluded from API responses
- [ ] HTTPS/TLS in production
- [ ] CORS properly configured
- [ ] Rate limiting implemented (optional but recommended)

---

## Post-Integration Testing

### Manual Testing Scenarios

**Scenario 1: Update Profile**
1. Log in as admin
2. Navigate to profile page
3. Update name and display name
4. Click "Update Profile"
5. Verify success message
6. Refresh page and verify changes persisted

**Scenario 2: Change Password**
1. Log in as admin
2. Navigate to profile page
3. Enter old password (incorrect)
4. Verify error message
5. Enter correct old password
6. Enter new password (not meeting requirements)
7. Verify validation error
8. Enter valid new password
9. Click "Change Password"
10. Verify success message
11. Try logging in with new password

**Scenario 3: Upload Avatar**
1. Log in as admin
2. Navigate to profile page
3. Try uploading non-image file
4. Verify error message
5. Try uploading > 2MB image
6. Verify size error
7. Upload valid image
8. Verify preview updates
9. Verify avatar URL saved

**Scenario 4: Change Email**
1. Log in as admin
2. Navigate to profile page
3. Try changing to duplicate email
4. Verify error message
5. Enter new valid email
6. Enter wrong password
7. Verify authentication error
8. Enter correct password
9. Verify confirmation message
10. Check email for verification link (if implemented)

---

## Performance Optimization

- [ ] Implement API response caching with React Query
- [ ] Use pagination if handling large datasets
- [ ] Optimize image uploads with compression
- [ ] Lazy load components if needed
- [ ] Monitor bundle size

---

## Deployment Checklist

### Before Production Deployment
- [ ] All tests pass
- [ ] Environment variables set correctly
- [ ] HTTPS/TLS certificates configured
- [ ] Database backups enabled
- [ ] Error logging configured
- [ ] Monitoring/alerting set up
- [ ] Rate limiting enabled
- [ ] CORS configured for production domain
- [ ] Code reviewed by team member
- [ ] Security audit completed

---

## Rollback Plan

If issues occur after deployment:

1. [ ] Keep backup of previous version
2. [ ] Document any breaking changes
3. [ ] Have rollback script ready
4. [ ] Test rollback in staging first
5. [ ] Monitor logs during rollback

---

## Maintenance & Updates

- [ ] Regular security updates for dependencies
- [ ] Monitor Cloudinary usage and costs
- [ ] Archive old user profile data if needed
- [ ] Update documentation as features change
- [ ] Regular database backups
- [ ] Monitor error logs for issues

---

## Support Resources

- Backend Service: `AdminProfileService`
- Frontend Component: `AdminProfilePage`
- API Documentation: `docs/admin_profile_management_README.md`
- Code Examples: `docs/admin_profile_code_examples.md`
- DTOs Location: `packages/backend/src/modules/admin/profile/dto/`

---

**Last Updated:** January 16, 2024
**Version:** 1.0.0
