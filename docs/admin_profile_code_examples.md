# Admin Profile Management - Code Examples & API Reference

## Quick Start Examples

### Backend Examples

#### 1. Using the Admin Profile Service
```typescript
// In your service or controller
import { AdminProfileService } from './admin-profile.service';
import { UpdateProfileDto } from './dto';

export class SomeService {
  constructor(private adminProfileService: AdminProfileService) {}

  async updateAdminInfo() {
    const userId = 'admin-uuid-123';
    const updateData: UpdateProfileDto = {
      fullName: 'Admin Full Name',
      displayName: 'Admin',
    };

    try {
      const result = await this.adminProfileService.updateProfile(userId, updateData);
      console.log('Profile updated:', result);
    } catch (error) {
      console.error('Update failed:', error.message);
    }
  }
}
```

#### 2. Calling the API from Backend
```typescript
// Example: In another module that needs to fetch admin profile
import { HttpService } from '@nestjs/axios';

export class ReportService {
  constructor(private http: HttpService) {}

  async generateReport(adminId: string) {
    // Get admin info via database or call own API
    const adminProfile = await this.adminProfileService.getProfile(adminId);
    return {
      generatedBy: adminProfile.name,
      timestamp: new Date(),
    };
  }
}
```

---

### Frontend Examples

#### 1. Using the Admin Profile API
```typescript
// In a React component
import { adminProfileApi } from '@/services/adminProfileApi';
import { useQuery, useMutation } from '@tanstack/react-query';

function MyComponent() {
  // Fetch profile
  const { data, isLoading } = useQuery({
    queryKey: ['admin-profile'],
    queryFn: adminProfileApi.getProfile,
  });

  // Update profile
  const updateMutation = useMutation({
    mutationFn: (data) => adminProfileApi.updateProfile(data),
    onSuccess: (response) => {
      console.log('Profile updated:', response.data);
    },
  });

  const handleUpdate = async () => {
    await updateMutation.mutateAsync({
      fullName: 'New Name',
      displayName: 'NewDisplay',
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{data?.data.name}</h1>
      <button onClick={handleUpdate}>Update Profile</button>
    </div>
  );
}
```

#### 2. Uploading Avatar
```typescript
import { useState } from 'react';
import { adminProfileApi } from '@/services/adminProfileApi';

function AvatarUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      const response = await adminProfileApi.uploadAvatar(file);
      console.log('Avatar updated:', response.data.avatar);
      alert('Avatar updated successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload avatar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleUpload} disabled={isLoading}>
        {isLoading ? 'Uploading...' : 'Upload Avatar'}
      </button>
    </div>
  );
}
```

#### 3. Password Change Flow
```typescript
import { useMutation } from '@tanstack/react-query';
import { adminProfileApi } from '@/services/adminProfileApi';

function ChangePasswordComponent() {
  const mutation = useMutation({
    mutationFn: async (formData) => {
      // Validation already done in component
      return adminProfileApi.changePassword(formData);
    },
    onSuccess: (response) => {
      console.log(response.message);
      // Redirect to login after password change
      window.location.href = '/login';
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Password change failed';
      console.error(message);
    },
  });

  const handleSubmit = (data: ChangePasswordFormData) => {
    mutation.mutate({
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
      confirmNewPassword: data.confirmNewPassword,
    });
  };

  return (
    // Component JSX
    <>
      {mutation.isPending && <p>Updating password...</p>}
      {mutation.isError && <p>Error: {mutation.error?.message}</p>}
    </>
  );
}
```

---

## API Response Examples

### Success Response Format
All successful responses follow this format:

```typescript
interface SuccessResponse<T> {
  statusCode: 200 | 201;
  message: string;
  data: T | null;
}
```

**Example:**
```json
{
  "statusCode": 200,
  "message": "Thao tác thành công",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Admin",
    "email": "john@example.com",
    "avatar": "https://res.cloudinary.com/restaurant/image/upload/v123456/avatar.jpg"
  }
}
```

### Error Response Format
Error responses include error codes:

```typescript
interface ErrorResponse {
  statusCode: 400 | 401 | 403 | 409 | 500;
  message: string;
  error: 'BadRequest' | 'Unauthorized' | 'Forbidden' | 'Conflict' | 'InternalServerError';
}
```

**Example:**
```json
{
  "statusCode": 400,
  "message": "Mật khẩu cũ không chính xác",
  "error": "BadRequest"
}
```

---

## Validation Examples

### Frontend Form Validation

#### PasswordInput Validation
```typescript
const validatePassword = (password: string): string[] => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Mật khẩu phải có ít nhất 8 ký tự');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất 1 chữ hoa');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất 1 chữ thường');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Mật khẩu phải chứa ít nhất 1 số');
  }

  return errors;
};

// Usage
const errors = validatePassword('newpassword');
// Returns: ['Mật khẩu phải chứa ít nhất 1 chữ hoa', 'Mật khẩu phải chứa ít nhất 1 số']
```

#### Email Validation
```typescript
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Usage
validateEmail('admin@example.com'); // true
validateEmail('invalid-email'); // false
```

---

## Security Implementation Examples

### Password Hashing
```typescript
import * as bcrypt from 'bcrypt';

// In your service
async changePassword(userId: string, oldPassword: string, newPassword: string) {
  const user = await this.userRepository.findOne(
    { where: { id: userId } },
    { select: ['password'] }
  );

  // Verify old password
  const isValidPassword = await bcrypt.compare(oldPassword, user.password);
  if (!isValidPassword) {
    throw new UnauthorizedException('Mật khẩu cũ không chính xác');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;

  await this.userRepository.save(user);
}
```

### JWT Token Extraction
```typescript
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

export class AuthService {
  constructor(private jwtService: JwtService) {}

  extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  async validateToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
```

### File Upload Validation
```typescript
export class FileValidationService {
  validateImage(file: Express.Multer.File): { isValid: boolean; error?: string } {
    // Validate MIME type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimes.includes(file.mimetype)) {
      return {
        isValid: false,
        error: 'Chỉ hỗ trợ JPG, JPEG, PNG',
      };
    }

    // Validate file size (2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'Kích thước tệp không được vượt quá 2MB',
      };
    }

    return { isValid: true };
  }
}
```

---

## Complete Component Example

### Full Profile Update Form
```typescript
import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { adminProfileApi } from '@/services/adminProfileApi';
import { FormInput } from '@/components/FormComponents';

interface ProfileFormProps {
  initialName: string;
  initialDisplay?: string;
}

export const ProfileUpdateForm: React.FC<ProfileFormProps> = ({
  initialName,
  initialDisplay,
}) => {
  const [formData, setFormData] = useState({
    fullName: initialName,
    displayName: initialDisplay || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const mutation = useMutation({
    mutationFn: adminProfileApi.updateProfile,
    onSuccess: (response) => {
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Update failed';
      setErrors({ submit: message });
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      <FormInput
        label="Full Name"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        error={errors.fullName}
        required
      />

      <FormInput
        label="Display Name (Optional)"
        name="displayName"
        value={formData.displayName}
        onChange={handleChange}
        error={errors.displayName}
      />

      {errors.submit && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errors.submit}
        </div>
      )}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {mutation.isPending ? 'Updating...' : 'Update Profile'}
      </button>
    </form>
  );
};
```

---

## Testing Examples

### Backend Unit Test Example
```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminProfileService } from './admin-profile.service';
import { User } from '../../user/user.entity';

describe('AdminProfileService', () => {
  let service: AdminProfileService;
  let mockUserRepository: any;

  beforeEach(async () => {
    mockUserRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminProfileService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<AdminProfileService>(AdminProfileService);
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const userId = 'test-uuid';
      const user = {
        id: userId,
        name: 'Old Name',
        displayName: null,
        save: jest.fn(),
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue({
        ...user,
        name: 'New Name',
      });

      const result = await service.updateProfile(userId, {
        fullName: 'New Name',
      });

      expect(result.name).toBe('New Name');
      expect(mockUserRepository.save).toHaveBeenCalled();
    });
  });
});
```

### Frontend Component Test Example
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfileInfoForm } from './ProfileInfoForm';

describe('ProfileInfoForm', () => {
  const queryClient = new QueryClient();

  it('should render form inputs', () => {
    const mockSubmit = jest.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <ProfileInfoForm
          initialData={{ fullName: 'Admin' }}
          onSubmit={mockSubmit}
        />
      </QueryClientProvider>
    );

    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    const mockSubmit = jest.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <ProfileInfoForm
          initialData={{ fullName: '' }}
          onSubmit={mockSubmit}
        />
      </QueryClientProvider>
    );

    const submitButton = screen.getByText(/Update/i);
    fireEvent.click(submitButton);

    expect(screen.getByText(/required/i)).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });
});
```

---

## Troubleshooting Examples

### Issue: Password change fails with "Old password incorrect"
```typescript
// Debug approach:
// 1. Check that password field is selected
const user = await this.userRepository.findOne(
  { where: { id: userId } },
  { select: ['password'] }  // Ensure password is selected!
);

// 2. Verify bcrypt comparison
console.log('Provided:', oldPassword);
console.log('Stored hash:', user.password);
const isValid = await bcrypt.compare(oldPassword, user.password);
console.log('Comparison result:', isValid);
```

### Issue: Avatar upload shows "Cloudinary credentials missing"
```typescript
// Check environment variables
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY);
console.log('API Secret:', process.env.CLOUDINARY_API_SECRET);

// Verify in .env file
// CLOUDINARY_CLOUD_NAME=xxx
// CLOUDINARY_API_KEY=yyy
// CLOUDINARY_API_SECRET=zzz
```

### Issue: Email change not working
```typescript
// Implement email sending:
import { MailerService } from '@nestjs-modules/mailer';

export class AdminProfileService {
  constructor(private mailerService: MailerService) {}

  async initiateEmailChange(userId: string, newEmail: string) {
    // Generate token
    const token = this.generateVerificationToken(newEmail);

    // Send email
    await this.mailerService.sendMail({
      to: newEmail,
      subject: 'Verify your new email',
      template: 'email-verification',
      context: {
        verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${token}`,
      },
    });
  }
}
```

---

**Document Version:** 1.0.0
**Last Updated:** January 16, 2024
