import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../user/user.entity';
import { CreateStaffDto, UpdateStaffDto } from './dto';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Create a new staff account (WAITER or KITCHEN_STAFF)
   */
  async createStaff(createStaffDto: CreateStaffDto): Promise<Omit<User, 'password'>> {
    const { email, fullName, password, role } = createStaffDto;

    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('Email này đã được sử dụng');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new staff account
    const staff = this.userRepository.create({
      name: fullName,
      email,
      password: hashedPassword,
      role,
      isVerified: true, // Auto-verify staff accounts created by admin
    });

    const savedStaff = await this.userRepository.save(staff);

    // Return without password
    const { password: _, ...staffWithoutPassword } = savedStaff;
    return staffWithoutPassword;
  }

  /**
   * Get all staff accounts (WAITER and KITCHEN_STAFF)
   */
  async getAllStaff(): Promise<Omit<User, 'password'>[]> {
    const staffList = await this.userRepository.find({
      where: [
        { role: UserRole.WAITER },
        { role: UserRole.KITCHEN_STAFF },
      ],
      select: ['id', 'name', 'email', 'role', 'avatar', 'createdAt', 'updatedAt'],
    });

    return staffList;
  }

  /**
   * Get a specific staff member by ID
   */
  async getStaffById(staffId: string): Promise<Omit<User, 'password'>> {
    const staff = await this.userRepository.findOne({
      where: { id: staffId },
      select: ['id', 'name', 'email', 'role', 'avatar', 'createdAt', 'updatedAt'],
    });

    if (!staff) {
      throw new NotFoundException('Nhân viên không tồn tại');
    }

    // Check if staff is actually WAITER or KITCHEN_STAFF
    if (![UserRole.WAITER, UserRole.KITCHEN_STAFF].includes(staff.role)) {
      throw new NotFoundException('Tài khoản này không phải là nhân viên');
    }

    return staff;
  }

  /**
   * Update staff information
   */
  async updateStaff(
    staffId: string,
    updateStaffDto: UpdateStaffDto,
  ): Promise<Omit<User, 'password'>> {
    const staff = await this.userRepository.findOne({
      where: { id: staffId },
    });

    if (!staff) {
      throw new NotFoundException('Nhân viên không tồn tại');
    }

    // Check if staff is actually WAITER or KITCHEN_STAFF
    if (![UserRole.WAITER, UserRole.KITCHEN_STAFF].includes(staff.role)) {
      throw new NotFoundException('Tài khoản này không phải là nhân viên');
    }

    // Check if new email is already in use (and different from current email)
    if (updateStaffDto.email && updateStaffDto.email !== staff.email) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: updateStaffDto.email },
      });
      if (existingEmail) {
        throw new BadRequestException('Email này đã được sử dụng');
      }
    }

    // Update allowed fields
    if (updateStaffDto.fullName) {
      staff.name = updateStaffDto.fullName;
    }
    if (updateStaffDto.email) {
      staff.email = updateStaffDto.email;
    }
    if (updateStaffDto.role) {
      staff.role = updateStaffDto.role;
    }

    const updatedStaff = await this.userRepository.save(staff);

    const { password: _, ...staffWithoutPassword } = updatedStaff;
    return staffWithoutPassword;
  }

  /**
   * Delete a staff account
   */
  async deleteStaff(staffId: string): Promise<{ message: string }> {
    const staff = await this.userRepository.findOne({
      where: { id: staffId },
    });

    if (!staff) {
      throw new NotFoundException('Nhân viên không tồn tại');
    }

    // Check if staff is actually WAITER or KITCHEN_STAFF
    if (![UserRole.WAITER, UserRole.KITCHEN_STAFF].includes(staff.role)) {
      throw new NotFoundException('Tài khoản này không phải là nhân viên');
    }

    await this.userRepository.remove(staff);

    return {
      message: 'Xoá nhân viên thành công',
    };
  }
}
