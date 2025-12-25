import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuCategoriesController } from './menu-categories.controller';
import { MenuCategoriesService } from './menu-categories.service';
import { MenuCategoryEntity } from './entities/menu-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MenuCategoryEntity]), // Đăng ký Entity để sử dụng Repository
  ],
  controllers: [MenuCategoriesController],
  providers: [MenuCategoriesService],
  exports: [MenuCategoriesService], // Export nếu các module khác (như MenuItems) cần dùng
})
export class MenuCategoriesModule {}