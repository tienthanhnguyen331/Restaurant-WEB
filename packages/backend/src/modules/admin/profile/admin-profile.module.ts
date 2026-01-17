import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../user/user.entity';
import { AdminProfileService } from './admin-profile.service';
import { AdminProfileController } from './admin-profile.controller';
import { CloudinaryModule } from '../../../common/cloudinary/cloudinary.module';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    CloudinaryModule,
    AuthModule,
    require('../../email/email.module').EmailModule,
  ],
  providers: [AdminProfileService],
  controllers: [AdminProfileController],
  exports: [AdminProfileService],
})
export class AdminProfileModule {}
