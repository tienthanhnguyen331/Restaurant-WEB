import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../modules/auth/auth.module';
import { TableEntity } from '../tables/table.entity';
import { QrController } from './qr.controller';
import { QrService } from './qr.service';
import { QrUtils } from './qr.utils';
import { QrVerifyGuard } from './guards/qr-verify.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([TableEntity]), // Cần truy cập bảng Tables
    AuthModule,
  ],
  controllers: [QrController],
  providers: [QrService, QrUtils, QrVerifyGuard],
  exports: [QrService, QrUtils, QrVerifyGuard], // Export để dùng ở nơi khác nếu cần
})
export class QrAuthModule {}