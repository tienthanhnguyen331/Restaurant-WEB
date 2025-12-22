import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ModifierGroupEntity } from './entities/modifier-group.entity';
import { ModifierOptionEntity } from './entities/modifier-option.entity';
import { MenuItemModifierGroupEntity } from './entities/menu-item-modifier-group.entity';
import { MenuItemEntity } from '../menu-items/entities/menu-item.entity';
import { 
  CreateModifierGroupDto, 
  UpdateModifierGroupDto, 
  CreateModifierOptionDto, 
  UpdateModifierOptionDto,
  AttachModifierGroupsDto 
} from './dto/modifier.dto';
import type { ModifierGroupSelectionType } from '@shared/types/menu';

/**
 * Service xử lý logic cho Modifier Groups và Options
 */
@Injectable()
export class ModifierService {
  constructor(
    @InjectRepository(ModifierGroupEntity)
    private readonly modifierGroupRepo: Repository<ModifierGroupEntity>,
    @InjectRepository(ModifierOptionEntity)
    private readonly modifierOptionRepo: Repository<ModifierOptionEntity>,
    @InjectRepository(MenuItemModifierGroupEntity)
    private readonly itemModifierRepo: Repository<MenuItemModifierGroupEntity>,
    @InjectRepository(MenuItemEntity)
    private readonly menuItemRepo: Repository<MenuItemEntity>,
  ) {}

  /**
   * Tạo mới Modifier Group
   * Validation: 
   * - isRequired: true -> phải có ít nhất 1 option (kiểm tra sau khi thêm option)
   * - minSelections/maxSelections: logic range
   */
  async createModifierGroup(
    restaurantId: string,
    dto: CreateModifierGroupDto,
  ): Promise<ModifierGroupEntity> {
    const normalized = this.normalizeMinMax(dto);
    this.validateMinMaxSelections(normalized);

    const group = this.modifierGroupRepo.create({
      ...dto,
      ...normalized,
      restaurantId,
      isRequired: dto.isRequired ?? false,
      displayOrder: dto.displayOrder ?? 0,
      status: dto.status ?? 'active',
    });

    return await this.modifierGroupRepo.save(group);
  }

  /**
   * Cập nhật Modifier Group
   */
  async updateModifierGroup(
    groupId: string,
    restaurantId: string,
    dto: UpdateModifierGroupDto,
  ): Promise<ModifierGroupEntity> {
    const group = await this.modifierGroupRepo.findOne({
      where: { id: groupId, restaurantId },
      relations: ['options'],
    });

    if (!group) {
      throw new NotFoundException(`Modifier group với ID ${groupId} không tồn tại`);
    }

    const normalized = this.normalizeMinMax({ ...group, ...dto });
    this.validateMinMaxSelections(normalized);

    // Validate isRequired logic: nếu set isRequired = true, phải có ít nhất 1 option
    if (dto.isRequired === true && (!group.options || group.options.length === 0)) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Không thể set isRequired = true khi group chưa có option nào',
        errors: {
          isRequired: ['Group bắt buộc phải có ít nhất 1 option'],
        },
      });
    }

    // Clear min/max when chuyển về single
    const payload = normalized.selectionType === 'single'
      ? { ...dto, minSelections: undefined, maxSelections: undefined }
      : { ...dto, minSelections: normalized.minSelections, maxSelections: normalized.maxSelections };

    Object.assign(group, payload);
    return await this.modifierGroupRepo.save(group);
  }

  /**
   * Xóa modifier group (và options) nếu thuộc nhà hàng
   * Đồng thời gỡ liên kết với các menu item
   */
  async deleteModifierGroup(
    groupId: string,
    restaurantId: string,
  ): Promise<void> {
    const group = await this.modifierGroupRepo.findOne({ where: { id: groupId, restaurantId } });

    if (!group) {
      throw new NotFoundException(`Modifier group với ID ${groupId} không tồn tại`);
    }

    // Gỡ link item-group trước để tránh orphan
    await this.itemModifierRepo.delete({ modifierGroupId: groupId });

    // Xóa group (options sẽ bị xóa do onDelete cascade ở relation option->group)
    await this.modifierGroupRepo.remove(group);
  }

  /**
   * Lấy tất cả Modifier Groups của restaurant
   */
  async getAllModifierGroups(restaurantId: string): Promise<ModifierGroupEntity[]> {
    return await this.modifierGroupRepo.find({
      where: { restaurantId },
      relations: ['options'],
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  /**
   * Lấy 1 Modifier Group theo ID
   */
  async getModifierGroupById(
    groupId: string,
    restaurantId: string,
  ): Promise<ModifierGroupEntity> {
    const group = await this.modifierGroupRepo.findOne({
      where: { id: groupId, restaurantId },
      relations: ['options'],
    });

    if (!group) {
      throw new NotFoundException(`Modifier group với ID ${groupId} không tồn tại`);
    }

    return group;
  }

  /**
   * Thêm Option vào Modifier Group
   */
  async addOptionToGroup(
    groupId: string,
    restaurantId: string,
    dto: CreateModifierOptionDto,
  ): Promise<ModifierOptionEntity> {
    // Verify group exists và thuộc restaurant
    const group = await this.getModifierGroupById(groupId, restaurantId);

    const option = this.modifierOptionRepo.create({
      ...dto,
      groupId,
      priceAdjustment: dto.priceAdjustment ?? 0,
      status: dto.status ?? 'active',
    });

    return await this.modifierOptionRepo.save(option);
  }

  /**
   * Cập nhật Option
   */
  async updateOption(
    optionId: string,
    restaurantId: string,
    dto: UpdateModifierOptionDto,
  ): Promise<ModifierOptionEntity> {
    const option = await this.modifierOptionRepo.findOne({
      where: { id: optionId },
      relations: ['group'],
    });

    if (!option) {
      throw new NotFoundException(`Modifier option với ID ${optionId} không tồn tại`);
    }

    // Verify option thuộc restaurant (qua group)
    if (!option.group || option.group.restaurantId !== restaurantId) {
      throw new NotFoundException(`Modifier option với ID ${optionId} không tồn tại`);
    }

    Object.assign(option, dto);
    return await this.modifierOptionRepo.save(option);
  }

  /**
   * Attach modifier groups vào menu item
   * Validation: group IDs phải tồn tại và thuộc cùng restaurant
   */
  async attachModifierGroupsToItem(
    itemId: string,
    restaurantId: string,
    dto: AttachModifierGroupsDto,
  ): Promise<void> {
    // Verify item exists và thuộc restaurant
    const item = await this.menuItemRepo.findOne({
      where: { id: itemId, restaurantId },
    });

    if (!item) {
      throw new NotFoundException(`Menu item với ID ${itemId} không tồn tại`);
    }

    // Verify tất cả groups tồn tại và thuộc restaurant
    const groups = await this.modifierGroupRepo.find({
      where: { 
        id: In(dto.modifierGroupIds),
        restaurantId,
      },
    });

    if (groups.length !== dto.modifierGroupIds.length) {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Một số modifier group không hợp lệ',
        errors: {
          modifierGroupIds: ['Một hoặc nhiều modifier group không tồn tại hoặc không thuộc restaurant này'],
        },
      });
    }

    // Xóa các liên kết cũ
    await this.itemModifierRepo.delete({ menuItemId: itemId });

    // Tạo liên kết mới
    const links = dto.modifierGroupIds.map(groupId =>
      this.itemModifierRepo.create({
        menuItemId: itemId,
        modifierGroupId: groupId,
      }),
    );

    await this.itemModifierRepo.save(links);
  }

  /**
   * Detach modifier group khỏi menu item
   */
  async detachModifierGroupFromItem(
    itemId: string,
    groupId: string,
    restaurantId: string,
  ): Promise<void> {
    // Verify item exists và thuộc restaurant
    const item = await this.menuItemRepo.findOne({
      where: { id: itemId, restaurantId },
    });

    if (!item) {
      throw new NotFoundException(`Menu item với ID ${itemId} không tồn tại`);
    }

    // Verify group exists và thuộc restaurant
    const group = await this.modifierGroupRepo.findOne({
      where: { id: groupId, restaurantId },
    });

    if (!group) {
      throw new NotFoundException(`Modifier group với ID ${groupId} không tồn tại`);
    }

    const result = await this.itemModifierRepo.delete({
      menuItemId: itemId,
      modifierGroupId: groupId,
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `Liên kết giữa item ${itemId} và group ${groupId} không tồn tại`,
      );
    }
  }

  /**
   * Validate logic min/max selections
   * Rules:
   * - Nếu selectionType = 'single': không cần min/max
   * - Nếu selectionType = 'multiple' và có min/max:
   *   - min >= 0
   *   - max >= 1
   *   - min <= max
   */
  private validateMinMaxSelections(dto: {
    selectionType: ModifierGroupSelectionType;
    minSelections?: number | null;
    maxSelections?: number | null;
  }): void {
    const { selectionType, minSelections, maxSelections } = dto;

    if (selectionType === 'single') {
      return;
    }

    if (selectionType === 'multiple') {
      if (minSelections !== null && maxSelections !== null && minSelections !== undefined && maxSelections !== undefined) {
        if (minSelections > maxSelections) {
          throw new BadRequestException({
            code: 'VALIDATION_ERROR',
            message: 'minSelections không được lớn hơn maxSelections',
            errors: {
              minSelections: ['minSelections phải <= maxSelections'],
              maxSelections: ['maxSelections phải >= minSelections'],
            },
          });
        }
      }

      if (minSelections !== null && minSelections !== undefined && minSelections < 0) {
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'minSelections phải >= 0',
          errors: {
            minSelections: ['minSelections phải >= 0'],
          },
        });
      }

      if (maxSelections !== null && maxSelections !== undefined && maxSelections < 1) {
        throw new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'maxSelections phải >= 1',
          errors: {
            maxSelections: ['maxSelections phải >= 1'],
          },
        });
      }
    }
  }

  /**
   * Chuẩn hóa min/max cho selectionType
   * - single: loại bỏ min/max
   * - multiple: nếu isRequired=true và minSelections chưa set -> minSelections = 1
   */
  private normalizeMinMax<T extends {
    selectionType: ModifierGroupSelectionType;
    isRequired?: boolean;
    minSelections?: number | null;
    maxSelections?: number | null;
  }>(dto: T): T {
    if (dto.selectionType === 'single') {
      return { ...dto, minSelections: undefined, maxSelections: undefined } as T;
    }

    // multiple
    const min = dto.minSelections ?? (dto.isRequired ? 1 : undefined);
    const max = dto.maxSelections ?? undefined;

    return { ...dto, minSelections: min, maxSelections: max } as T;
  }
}
