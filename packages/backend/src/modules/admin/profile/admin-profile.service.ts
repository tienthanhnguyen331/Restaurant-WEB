import { 
  Injectable, 
  BadRequestException, 
  UnauthorizedException, 
  ConflictException,
  BadRequestException as FileSizeException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../user/user.entity';
import { UpdateProfileDto, ChangePasswordDto, ChangeEmailDto } from './dto';
import { CloudinaryService } from '../../../common/cloudinary/cloudinary.service';

@Injectable()
export class AdminProfileService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  /**
   * Get current admin's profile
   */
  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'displayName', 'email', 'avatar', 'role', 'isVerified', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    return user;
  }

  /**
   * Update admin's basic profile information
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    user.name = updateProfileDto.fullName;
    if (updateProfileDto.displayName) {
      user.displayName = updateProfileDto.displayName;
    }

    const updatedUser = await this.userRepository.save(user);

    const { password, verificationToken, ...result } = updatedUser;
    return result;
  }

  /**
   * Change password (with old password verification)
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<{ message: string }> {
    // Validate passwords match
    if (changePasswordDto.newPassword !== changePasswordDto.confirmNewPassword) {
      throw new BadRequestException('Mật khẩu mới và xác nhận mật khẩu không khớp');
    }

    // Validate new password is different from old password
    if (changePasswordDto.oldPassword === changePasswordDto.newPassword) {
      throw new BadRequestException('Mật khẩu mới phải khác với mật khẩu cũ');
    }

    // Get user with password field
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user || !user.password) {
      throw new BadRequestException('Người dùng không tồn tại hoặc chưa có mật khẩu');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu cũ không chính xác');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);
    user.password = hashedPassword;

    await this.userRepository.save(user);

    return { message: 'Mật khẩu đã được cập nhật thành công. Vui lòng đăng nhập lại.' };
  }

  /**
   * Initiate email change (send verification to new email)
   */
  async initiateEmailChange(userId: string, changeEmailDto: ChangeEmailDto): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'password'],
    });

    if (!user || !user.password) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(changeEmailDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu không chính xác');
    }

    // Check if new email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: changeEmailDto.newEmail },
    });

    if (existingUser) {
      throw new ConflictException('Email này đã được sử dụng');
    }

    // Generate email verification token (simple token for demo, use JWT in production)
    const verificationToken = Buffer.from(`${changeEmailDto.newEmail}:${Date.now()}`).toString('base64');

    // In production: Store token and send email with verification link
    // For now, we'll update immediately (simplified flow)
    user.email = changeEmailDto.newEmail;
    user.isVerified = false;
    user.verificationToken = verificationToken;

    await this.userRepository.save(user);

    // TODO: Send email verification email to new email address
    // EmailService.sendVerificationEmail(changeEmailDto.newEmail, verificationToken)

    return { 
      message: 'Email đã được cập nhật. Vui lòng kiểm tra email để xác nhận.' 
    };
  }

  /**
   * Upload and update avatar
   */
  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<Partial<User>> {
    if (!file) {
      throw new BadRequestException('Không có tệp được tải lên');
    }

    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Chỉ hỗ trợ định dạng JPG, JPEG, PNG');
    }

    // Validate file size (2MB limit)
    const maxFileSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxFileSize) {
      throw new BadRequestException('Kích thước tệp không được vượt quá 2MB');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    try {
      // Upload to Cloudinary
      const cloudinaryFile = {
        ...file,
        buffer: file.buffer,
      };

      const uploadResult = await this.cloudinaryService.uploadFile(cloudinaryFile);
      
      // Save avatar URL to user profile
      user.avatar = uploadResult.secure_url;
      const updatedUser = await this.userRepository.save(user);

      const { password, verificationToken, ...result } = updatedUser;
      return result;
    } catch (error) {
      throw new BadRequestException(`Không thể tải lên avatar: ${error.message}`);
    }
  }

  /**
   * Verify email change with token
   */
  async verifyEmailChange(userId: string, token: string): Promise<{ message: string }> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'verificationToken'],
    });

    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại');
    }

    if (user.verificationToken !== token) {
      throw new UnauthorizedException('Token xác nhận không hợp lệ');
    }

    user.isVerified = true;
    user.verificationToken = "";

    await this.userRepository.save(user);

    return { message: 'Email đã được xác nhận thành công' };
  }
}
