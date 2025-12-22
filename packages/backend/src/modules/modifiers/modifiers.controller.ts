import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  HttpCode, 
  HttpStatus,
  BadRequestException,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ModifierService } from './modifiers.service';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../../common/decorators/current-user.decorator';
import { 
  CreateModifierGroupDto, 
  UpdateModifierGroupDto, 
  CreateModifierOptionDto, 
  UpdateModifierOptionDto,
  AttachModifierGroupsDto 
} from './dto/modifier.dto';
import { ModifierGroupEntity } from './entities/modifier-group.entity';
import { ModifierOptionEntity } from './entities/modifier-option.entity';

/**
 * Controller xử lý các API endpoints cho Modifier Management
 * Tất cả endpoints yêu cầu authentication (admin)
 * Sử dụng AdminAuthGuard để verify và lấy restaurantId từ token
 */
@Controller('admin/menu')
@UseGuards(AdminAuthGuard)
export class ModifierController {
  constructor(private readonly modifierService: ModifierService) {}

  /**
   * 1. GET /api/admin/menu/modifier-groups
   * Lấy danh sách tất cả modifier groups
   */
  @Get('modifier-groups')
  async getAllModifierGroups(
    @CurrentUser('restaurantId') restaurantId: string,
  ): Promise<ModifierGroupEntity[]> {
    return await this.modifierService.getAllModifierGroups(restaurantId);
  }

  /**
   * 2. POST /api/admin/menu/modifier-groups
   * Tạo mới modifier group
   */
  @Post('modifier-groups')
  @HttpCode(HttpStatus.CREATED)
  async createModifierGroup(
    @CurrentUser('restaurantId') restaurantId: string,
    @Body() dto: CreateModifierGroupDto,
  ): Promise<ModifierGroupEntity> {
    try {
      return await this.modifierService.createModifierGroup(restaurantId, dto);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        code: 'CREATE_FAILED',
        message: 'Không thể tạo modifier group',
        errors: { general: [error.message] },
      });
    }
  }

  /**
   * 3. PUT /api/admin/menu/modifier-groups/:id
   * Cập nhật modifier group
   */
  @Put('modifier-groups/:id')
  async updateModifierGroup(
    @CurrentUser('restaurantId') restaurantId: string,
    @Param('id') groupId: string,
    @Body() dto: UpdateModifierGroupDto,
  ): Promise<ModifierGroupEntity> {
    try {
      return await this.modifierService.updateModifierGroup(groupId, restaurantId, dto);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        code: 'UPDATE_FAILED',
        message: 'Không thể cập nhật modifier group',
        errors: { general: [error.message] },
      });
    }
  }

  /**
   * 3b. DELETE /api/admin/menu/modifier-groups/:id
   * Xóa modifier group (và options), gỡ liên kết với items
   */
  @Delete('modifier-groups/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteModifierGroup(
    @CurrentUser('restaurantId') restaurantId: string,
    @Param('id') groupId: string,
  ): Promise<void> {
    try {
      await this.modifierService.deleteModifierGroup(groupId, restaurantId);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        code: 'DELETE_FAILED',
        message: 'Không thể xóa modifier group',
        errors: { general: [error.message] },
      });
    }
  }

  /**
   * 4. POST /api/admin/menu/modifier-groups/:id/options
   * Thêm option vào modifier group
   */
  @Post('modifier-groups/:id/options')
  @HttpCode(HttpStatus.CREATED)
  async addOptionToGroup(
    @CurrentUser('restaurantId') restaurantId: string,
    @Param('id') groupId: string,
    @Body() dto: CreateModifierOptionDto,
  ): Promise<ModifierOptionEntity> {
    try {
      return await this.modifierService.addOptionToGroup(groupId, restaurantId, dto);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        code: 'CREATE_OPTION_FAILED',
        message: 'Không thể thêm option vào group',
        errors: { general: [error.message] },
      });
    }
  }

  /**
   * 5. PUT /api/admin/menu/modifier-options/:id
   * Cập nhật modifier option
   */
  @Put('modifier-options/:id')
  async updateOption(
    @CurrentUser('restaurantId') restaurantId: string,
    @Param('id') optionId: string,
    @Body() dto: UpdateModifierOptionDto,
  ): Promise<ModifierOptionEntity> {
    try {
      return await this.modifierService.updateOption(optionId, restaurantId, dto);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        code: 'UPDATE_OPTION_FAILED',
        message: 'Không thể cập nhật option',
        errors: { general: [error.message] },
      });
    }
  }

  /**
   * 6. POST /api/admin/menu/items/:itemId/modifier-groups
   * Attach modifier groups vào menu item
   */
  @Post('items/:itemId/modifier-groups')
  @HttpCode(HttpStatus.NO_CONTENT)
  async attachModifierGroupsToItem(
    @CurrentUser('restaurantId') restaurantId: string,
    @Param('itemId') itemId: string,
    @Body() dto: AttachModifierGroupsDto,
  ): Promise<void> {
    try {
      await this.modifierService.attachModifierGroupsToItem(itemId, restaurantId, dto);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        code: 'ATTACH_FAILED',
        message: 'Không thể attach modifier groups vào item',
        errors: { general: [error.message] },
      });
    }
  }

  /**
   * 7. DELETE /api/admin/menu/items/:itemId/modifier-groups/:groupId
   * Detach modifier group khỏi menu item
   */
  @Delete('items/:itemId/modifier-groups/:groupId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async detachModifierGroupFromItem(
    @CurrentUser('restaurantId') restaurantId: string,
    @Param('itemId') itemId: string,
    @Param('groupId') groupId: string,
  ): Promise<void> {
    try {
      await this.modifierService.detachModifierGroupFromItem(itemId, groupId, restaurantId);
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException({
        code: 'DETACH_FAILED',
        message: 'Không thể detach modifier group khỏi item',
        errors: { general: [error.message] },
      });
    }
  }
}
