
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)], // Dùng forwardRef để tránh circular dependency
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Export để AuthModule có thể sử dụng UserService
})
export class UserModule {}