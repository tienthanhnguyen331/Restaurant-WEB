import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not } from 'typeorm';
import { MenuCategoryEntity } from './entities/menu-category.entity';
import { CreateMenuCategoryDto, UpdateMenuCategoryDto } from './dto/category.dto';
import { CategoryQueryDto } from './dto/category-query.dto';

@Injectable()
export class MenuCategoriesService {
  constructor(
    @InjectRepository(MenuCategoryEntity)
    private categoryRepo: Repository<MenuCategoryEntity>,
  ) {}

  // 1. Tạo mới danh mục
async create(dto: CreateMenuCategoryDto) {
  try {
    const existing = await this.categoryRepo.findOne({ 
      where: { name: dto.name, deletedAt: IsNull() } 
    });
    if (existing) throw new ConflictException('Tên danh mục đã tồn tại');

    const category = this.categoryRepo.create({
      ...dto,
      status: 'active'
    });
    
    return await this.categoryRepo.save(category);
  } catch (error) {
    // Dòng này cực kỳ quan trọng, nó sẽ in lỗi chi tiết ra console
    console.error("LỖI DB KHI TẠO CATEGORY:", error.message);
    throw error; 
  }
}

  // 2. Lấy danh sách (Đã có)
  async findAll(query: CategoryQueryDto) {
    const { search, status, page = 1, limit = 10, sort = 'displayOrder', order = 'ASC' } = query;
    const qb = this.categoryRepo.createQueryBuilder('category')
      .where('category.deletedAt IS NULL');

    if (search) qb.andWhere('category.name ILIKE :search', { search: `%${search}%` });
    if (status) qb.andWhere('category.status = :status', { status });

    qb.orderBy(`category.${sort}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  // 3. Lấy chi tiết 1 danh mục
  async findOne(id: string) {
    const category = await this.categoryRepo.findOne({ 
      where: { id, deletedAt: IsNull() } 
    });
    if (!category) throw new NotFoundException('Không tìm thấy danh mục');
    return category;
  }

  // 4. Cập nhật danh mục
  async update(id: string, dto: UpdateMenuCategoryDto) {
    const category = await this.findOne(id);

    if (dto.name && dto.name !== category.name) {
      const existing = await this.categoryRepo.findOne({
        where: { name: dto.name, id: Not(id), deletedAt: IsNull() }
      });
      if (existing) throw new ConflictException('Tên danh mục đã tồn tại');
    }

    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  // 5. Cập nhật riêng trạng thái
  async updateStatus(id: string, status: 'active' | 'inactive') {
    const category = await this.findOne(id);
    category.status = status;
    return this.categoryRepo.save(category);
  }

  // 6. Xóa mềm (Đã có)
  async remove(id: string) {
    const category = await this.findOne(id);
    return this.categoryRepo.softDelete(id);
  }
}