import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItemPhotosController } from './menu-item-photos.controller';
import { MenuItemPhotosService } from './menu-item-photos.service';
import { MenuItemPhotoEntity } from './entities/menu-item-photo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MenuItemPhotoEntity]),
  ],
  controllers: [MenuItemPhotosController],
  providers: [MenuItemPhotosService],
  exports: [MenuItemPhotosService],
})
export class MenuItemPhotosModule {}