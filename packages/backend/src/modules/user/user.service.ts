import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

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

  // Thêm các hàm create, update profile tại đây...
}