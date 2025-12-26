import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItemEntity } from './entities/menu-item.entity';
import { MenuItemsController } from './menu-items.controller';
import { MenuItemsService } from './menu-items.service';
import { MenuCategoryEntity } from '../menu-categories/entities/menu-category.entity';
import { ModifierGroupEntity } from '../modifiers/entities/modifier-group.entity';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItemEntity, MenuCategoryEntity, ModifierGroupEntity])],
  controllers: [MenuItemsController],
  providers: [MenuItemsService, AdminAuthGuard],
  exports: [MenuItemsService],
})
export class MenuItemsModule {}
