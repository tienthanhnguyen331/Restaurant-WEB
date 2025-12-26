import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateMenuItemDto, UpdateMenuItemDto, UpdateMenuItemStatusDto } from './dto/menu-item.dto';
import { MenuItemQueryDto } from './dto/menu-item-query.dto';
import { MenuItemsService } from './menu-items.service';

/**
 * Controller cho Menu Items (Admin)
 */
@Controller('admin/menu/items')
@UseGuards(AdminAuthGuard)
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  /**
   * GET /api/admin/menu/items
   * List items (filter/sort/page)
   */
  @Get()
  async list(
    @CurrentUser('restaurantId') restaurantId: string,
    @Query() query: MenuItemQueryDto,
  ) {
    return await this.menuItemsService.list(restaurantId, query);
  }

  /**
   * POST /api/admin/menu/items
   * Create new item
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('restaurantId') restaurantId: string,
    @Body() dto: CreateMenuItemDto,
  ) {
    return await this.menuItemsService.create(restaurantId, dto);
  }

  /**
   * GET /api/admin/menu/items/:id
   * Get item details
   */
  @Get(':id')
  async findOne(
    @CurrentUser('restaurantId') restaurantId: string,
    @Param('id') id: string,
  ) {
    return await this.menuItemsService.findOne(restaurantId, id);
  }

  /**
   * PUT /api/admin/menu/items/:id
   * Update item
   */
  @Put(':id')
  async update(
    @CurrentUser('restaurantId') restaurantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return await this.menuItemsService.update(restaurantId, id, dto);
  }

  /**
   * PATCH /api/admin/menu/items/:id/status
   * Update status only
   */
  @Patch(':id/status')
  async updateStatus(
    @CurrentUser('restaurantId') restaurantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateMenuItemStatusDto,
  ) {
    return await this.menuItemsService.updateStatus(restaurantId, id, dto.status);
  }

  /**
   * DELETE /api/admin/menu/items/:id
   * Soft delete item
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser('restaurantId') restaurantId: string,
    @Param('id') id: string,
  ) {
    await this.menuItemsService.remove(restaurantId, id);
  }
}
