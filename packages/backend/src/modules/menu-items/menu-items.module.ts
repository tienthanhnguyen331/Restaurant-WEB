import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItemEntity } from './entities/menu-item.entity';
import { MenuItemsController } from './menu-items.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MenuItemEntity])],
  controllers: [MenuItemsController],
  exports: [TypeOrmModule],
})
export class MenuItemsModule {}
