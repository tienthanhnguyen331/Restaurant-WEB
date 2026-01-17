import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '../../user/user.entity';
import { CreateStaffDto, UpdateStaffDto } from './dto';


@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly configService: ConfigService,
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

    // Generate verification token (giống AuthService)
    const verificationToken = randomBytes(32).toString('hex');
    const expirationHours = this.configService.get<number>('EMAIL_VERIFICATION_EXPIRES_IN', 24);
    const verificationTokenExpires = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

    // Create new staff account
    const staff = this.userRepository.create({
      name: fullName,
      email,
      password: hashedPassword,
      role,
      isVerified: true, // Cho phép đăng nhập ngay sau khi tạo
      verificationToken,
      verificationTokenExpires,
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
        { role: UserRole.ADMIN },
      ],
      select: ['id', 'name', 'email', 'role', 'avatar', 'createdAt', 'updatedAt', 'isVerified'],
    });

    return staffList;
  }

  /**
   * Get a specific staff member by ID
   */
  async getStaffById(staffId: string): Promise<Omit<User, 'password'>> {
    const staff = await this.userRepository.findOne({
      where: { id: staffId },
      select: ['id', 'name', 'email', 'role', 'avatar', 'createdAt', 'updatedAt', 'isVerified'],
    });

    if (!staff) {
      throw new NotFoundException('Nhân viên không tồn tại');
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
   * Disable staff account (set is_verified = false)
   */
  async disableStaff(staffId: string): Promise<Omit<User, 'password'>> {
    const staff = await this.userRepository.findOne({ where: { id: staffId } });
    if (!staff) {
      throw new NotFoundException('Nhân viên không tồn tại');
    }
    staff.isVerified = false;
    const updatedStaff = await this.userRepository.save(staff);
    const { password: _, ...staffWithoutPassword } = updatedStaff;
    return staffWithoutPassword;
  }
    /**
   * Enable staff account (set is_verified = true)
   */
  async enableStaff(staffId: string): Promise<Omit<User, 'password'>> {
    const staff = await this.userRepository.findOne({ where: { id: staffId } });
    if (!staff) {
      throw new NotFoundException('Nhân viên không tồn tại');
    }
    staff.isVerified = true;
    const updatedStaff = await this.userRepository.save(staff);
    const { password: _, ...staffWithoutPassword } = updatedStaff;
    return staffWithoutPassword;
  }
}
