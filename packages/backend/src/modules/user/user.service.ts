
import { Injectable, ConflictException } from '@nestjs/common';
  // Cập nhật user cho admin
  
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findOneByEmail(email: string): Promise<User | null> {
  return this.userRepository.findOne({
    where: { email },
    select: ['id', 'email', 'password', 'name', 'role'] // Ép kiểu lấy password ở đây
  });
}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async findOneById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      select: ['id', 'name', 'email', 'role', 'avatar','createdAt'],
    });
  }
  async updateUserByAdmin(id: string, body: { username: string; email: string; role: string }) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new Error('User not found');
    user.name = body.username;
    user.email = body.email;
    user.role = body.role as UserRole;
    await this.userRepository.save(user);
    // Trả về dữ liệu mới cho frontend
    return {
      id: user.id,
      username: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
  // Lấy danh sách user cho admin
  async findAllForAdmin(): Promise<Partial<User>[]> {
    return this.userRepository.find({
      select: ['id', 'name', 'email', 'role', 'createdAt', 'password'], // Thêm password vào select
      order: { createdAt: 'DESC' },
    });
  }
  async deleteUserByAdmin(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new Error('User not found');
    await this.userRepository.remove(user);
    return { success: true };
  }

  // Tạo user cho admin (có chọn role)
  async createUserByAdmin(body: { username: string; email: string; password: string; role: string }) {
    // Kiểm tra email đã tồn tại chưa
    const existed = await this.userRepository.findOne({ where: { email: body.email } });
    if (existed) throw new ConflictException('Email đã tồn tại');
    const user = this.userRepository.create({
      name: body.username,
      email: body.email,
      password: body.password, // Có thể hash nếu muốn bảo mật hơn
      role: body.role as UserRole,
    });
    await this.userRepository.save(user);
    return {
      id: user.id,
      username: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}