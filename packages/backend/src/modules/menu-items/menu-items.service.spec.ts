import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
// 1. Thêm ObjectLiteral vào import này
import { Repository, ObjectLiteral } from 'typeorm'; 

import { MenuItemsService } from './menu-items.service';
import { MenuItemEntity } from './entities/menu-item.entity';
import { MenuCategoryEntity } from '../menu-categories/entities/menu-category.entity';
import { ModifierGroupEntity } from '../modifiers/entities/modifier-group.entity';

// 2. Sửa dòng này: thêm "extends ObjectLiteral"
type MockRepository<T extends ObjectLiteral> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('MenuItemsService', () => {
  let service: MenuItemsService;
  
  let itemRepo: MockRepository<MenuItemEntity>;
  let categoryRepo: MockRepository<MenuCategoryEntity>;
  let modifierGroupRepo: MockRepository<ModifierGroupEntity>;

  const restaurantId = '00000000-0000-0000-0000-000000000000';

  beforeEach(async () => {
    itemRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    categoryRepo = {
      findOne: jest.fn(),
    };

    modifierGroupRepo = {
      find: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MenuItemsService,
        { provide: getRepositoryToken(MenuItemEntity), useValue: itemRepo },
        { provide: getRepositoryToken(MenuCategoryEntity), useValue: categoryRepo },
        { provide: getRepositoryToken(ModifierGroupEntity), useValue: modifierGroupRepo },
      ],
    }).compile();

    service = moduleRef.get(MenuItemsService);
  });

  it('throws NotFound when category not exists', async () => {
    categoryRepo.findOne!.mockResolvedValue(null);

    await expect(
      service.create(restaurantId, {
        categoryId: '00000000-0000-0000-0000-000000000010',
        name: 'Pizza',
        price: 10,
        status: 'available',
      } as any),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws BadRequest when category belongs to another restaurant', async () => {
    categoryRepo.findOne!.mockResolvedValue({
      id: 'cat-1',
      restaurantId: '00000000-0000-0000-0000-000000000999',
      isDeleted: false,
      deletedAt: null,
    });

    await expect(
      service.create(restaurantId, {
        categoryId: 'cat-1',
        name: 'Pizza',
        price: 10,
        status: 'available',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws BadRequest when modifierGroupIds invalid', async () => {
    categoryRepo.findOne!.mockResolvedValue({
      id: 'cat-1',
      restaurantId,
      isDeleted: false,
      deletedAt: null,
    });

    modifierGroupRepo.find!.mockResolvedValue([{ id: 'g1', restaurantId }]);

    await expect(
      service.create(restaurantId, {
        categoryId: 'cat-1',
        name: 'Pizza',
        price: 10,
        status: 'available',
        modifierGroupIds: ['g1', 'g2'],
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates item and normalizes response', async () => {
    categoryRepo.findOne!.mockResolvedValue({
      id: 'cat-1',
      restaurantId,
      isDeleted: false,
      deletedAt: null,
    });

    modifierGroupRepo.find!.mockResolvedValue([]);

    itemRepo.create!.mockReturnValue({ id: 'i1', photos: [] }); 
    itemRepo.save!.mockResolvedValue({ id: 'i1', price: '12.50', photos: [] });

    const created = await service.create(restaurantId, {
      categoryId: 'cat-1',
      name: 'Pizza',
      price: 12.5,
      status: 'available',
    } as any);

    expect(created.id).toBe('i1');
    expect(created.price).toBe(12.5);
    expect(created.primaryPhotoUrl).toBeNull();
  });
});