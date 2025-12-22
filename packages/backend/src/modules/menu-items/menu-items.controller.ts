import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItemEntity } from './entities/menu-item.entity';

/**
 * Controller cho Menu Items (Admin)
 * TODO: Thêm authentication guard khi ready
 */
@Controller('admin/menu/items')
export class MenuItemsController {
  constructor(
    @InjectRepository(MenuItemEntity)
    private readonly menuItemRepo: Repository<MenuItemEntity>,
  ) {}

  /**
   * GET /api/admin/menu/items
   * Lấy danh sách menu items (simplified cho dropdown)
   */
  @Get()
  async getAllItems() {
    // TODO: Add restaurantId từ authenticated user
    const restaurantId = '00000000-0000-0000-0000-000000000000'; // Placeholder

    const items = await this.menuItemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .where('item.restaurant_id = :restaurantId', { restaurantId })
      .andWhere('item.is_deleted = :isDeleted', { isDeleted: false })
      .orderBy('item.name', 'ASC')
      .select([
        'item.id',
        'item.name',
        'item.price',
        'item.description',
        'item.status',
        'item.isChefRecommended',
        'item.categoryId',
        'category.name',
      ])
      .getMany();

    // Format response
    return items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      categoryId: item.categoryId,
      categoryName: item.category?.name,
      description: item.description,
      status: item.status,
      isChefRecommended: item.isChefRecommended,
    }));
  }
}
