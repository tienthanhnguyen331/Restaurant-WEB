import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { AdminProfileService } from './admin-profile.service';
import { UpdateProfileDto, ChangePasswordDto, ChangeEmailDto } from './dto';
import { UserRole } from '../../user/user.entity';

import { Query, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('admin/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminProfileController {
    /**
     * GET /admin/profile/verify-email?token=...
     * Xác nhận email qua link từ email (không cần đăng nhập)
     */
    @Get('/verify-email')
    @UseGuards() // override global guards, make this route public
    async verifyEmailByToken(@Query('token') token: string, @Res() res: Response) {
      if (!token) {
        return res.status(400).send('Thiếu token xác nhận.');
      }
      // Tìm user theo verificationToken
      const user = await this.adminProfileService['userRepository'].findOne({ where: { verificationToken: token } });
      if (!user) {
        return res.status(400).send('Token xác nhận không hợp lệ hoặc đã hết hạn.');
      }
      if (user.isVerified) {
        return res.send('Email đã được xác nhận trước đó.');
      }
      user.isVerified = true;
      user.verificationToken = '';
      await this.adminProfileService['userRepository'].save(user);
      return res.send('Xác nhận email thành công! Bạn có thể đăng nhập.');
    }
  constructor(private readonly adminProfileService: AdminProfileService) {}

  /**
   * GET /admin/profile
   * Get current admin's profile information
   */
  @Get()
  @Roles(UserRole.ADMIN)
  async getProfile(@CurrentUser() user: any) {
    const userId = user.sub;
    const profile = await this.adminProfileService.getProfile(userId);
    return {
      statusCode: 200,
      message: 'Lấy thông tin hồ sơ thành công',
      data: profile,
    };
  }

  /**
   * PATCH /admin/profile
   * Update basic profile information (name, display name)
   */
  @Patch()
  @Roles(UserRole.ADMIN)
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const userId = user.sub;
    const updatedProfile = await this.adminProfileService.updateProfile(userId, updateProfileDto);
    return {
      statusCode: 200,
      message: 'Cập nhật hồ sơ thành công',
      data: updatedProfile,
    };
  }

  /**
   * PATCH /admin/profile/password
   * Change password with old password verification
   */
  @Patch('password')
  @Roles(UserRole.ADMIN)
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = user.sub;
    const result = await this.adminProfileService.changePassword(userId, changePasswordDto);
    return {
      statusCode: 200,
      message: result.message,
      data: null,
    };
  }


  /**
   * POST /admin/profile/avatar
   * Upload and update admin avatar
   */
  @Post('avatar')
  @Roles(UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = user.sub;
    if (!file) {
      throw new BadRequestException('Vui lòng tải lên một tệp hình ảnh');
    }

    const updatedProfile = await this.adminProfileService.uploadAvatar(userId, file);
    return {
      statusCode: 200,
      message: 'Tải lên avatar thành công',
      data: {
    avatar: updatedProfile.avatar,
  },
    };
  }

}
