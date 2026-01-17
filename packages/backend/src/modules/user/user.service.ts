
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
// Cập nhật user cho admin

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  async findOneByEmail(email: string): Promise<User | null> {
      return this.userRepository.findOne({
        where: { email },
        select: ['id', 'email', 'password', 'name', 'role', 'isVerified'], // Ép kiểu lấy password ở đây
    });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { verificationToken: token },
      select: [
        'id',
        'email',
        'name',
        'verificationToken',
        'verificationTokenExpires',
        'isVerified',
      ],
    });
  }

  async findByResetPasswordToken(token: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { resetPasswordToken: token },
      select: [
        'id',
        'email',
        'name',
        'resetPasswordToken',
        'resetPasswordTokenExpires',
      ],
      });
    }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, userData);
    return this.findOneById(id);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findOneById(id: string): Promise<User> {
  const user = await this.userRepository.findOne({
    where: { id },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  return user;
}


  // Lấy thông tin profile cho user đang đăng nhập
  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'displayName', 'email', 'avatar', 'role', 'isVerified', 'createdAt', 'updatedAt'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Cập nhật thông tin profile cho user đang đăng nhập
  async updateProfile(userId: string, updateProfileDto: { fullName: string; displayName?: string }): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.name = updateProfileDto.fullName;
    if (updateProfileDto.displayName) {
      user.displayName = updateProfileDto.displayName;
    }
    const updatedUser = await this.userRepository.save(user);
    const { password, verificationToken, ...result } = updatedUser;
    return result;
  }
}