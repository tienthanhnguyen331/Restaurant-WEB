

import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../user/user.entity';
import { StaffService } from './staff.service';
import { CreateStaffDto, UpdateStaffDto } from './dto';

@Controller('admin/staff')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  /**
   * POST /admin/staff
   * Create a new staff account (WAITER or KITCHEN_STAFF)
   */
  @Post()
  async createStaff(@Body() createStaffDto: CreateStaffDto) {
    const staff = await this.staffService.createStaff(createStaffDto);
    return {
      statusCode: 201,
      message: 'Tạo tài khoản nhân viên thành công',
      data: staff,
    };
  }

  /**
   * GET /admin/staff
   * Get list of all staff accounts
   */
  @Get()
  async getAllStaff() {
    const staffList = await this.staffService.getAllStaff();
    return {
      statusCode: 200,
      message: 'Lấy danh sách nhân viên thành công',
      data: staffList,
    };
  }

  /**
   * GET /admin/staff/:id
   * Get a specific staff member by ID
   */
  @Get(':id')
  async getStaffById(@Param('id') staffId: string) {
    const staff = await this.staffService.getStaffById(staffId);
    return {
      statusCode: 200,
      message: 'Lấy thông tin nhân viên thành công',
      data: staff,
    };
  }

  /**
   * PATCH /admin/staff/:id
   * Update staff information
   */
  @Patch(':id')
  async updateStaff(
    @Param('id') staffId: string,
    @Body() updateStaffDto: UpdateStaffDto,
  ) {
    const staff = await this.staffService.updateStaff(staffId, updateStaffDto);
    return {
      statusCode: 200,
      message: 'Cập nhật thông tin nhân viên thành công',
      data: staff,
    };
  }

    /**
   * PATCH /admin/staff/:id/disable
   * Disable staff account (set is_verified = false)
   */
  @Patch(':id/disable')
  async disableStaff(@Param('id') staffId: string) {
    const staff = await this.staffService.disableStaff(staffId);
    return {
      statusCode: 200,
      message: 'Tài khoản đã được vô hiệu hóa',
      data: staff,
    };
  }
    @Patch(':id/enable')
  async enableStaff(@Param('id') staffId: string) {
    const staff = await this.staffService.enableStaff(staffId);
    return {
      statusCode: 200,
      message: 'Tài khoản đã được kích hoạt lại',
      data: staff,
    };
  }
}
