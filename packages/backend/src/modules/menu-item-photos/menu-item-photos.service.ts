import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItemPhotoEntity } from './entities/menu-item-photo.entity';

@Injectable()
export class MenuItemPhotosService {
  constructor(
    @InjectRepository(MenuItemPhotoEntity)
    private readonly photoRepo: Repository<MenuItemPhotoEntity>,
  ) {}

  // 1. Hàm lấy danh sách ảnh theo ID món ăn
  async findAllByItem(menuItemId: string) {
    return this.photoRepo.find({
      where: { menuItemId },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  // 2. Hàm lưu thông tin ảnh vào Database
  async create(data: { menuItemId: string; url: string; isPrimary: boolean }) {
    const photo = this.photoRepo.create(data);
    return this.photoRepo.save(photo);
  }

  // 3. Hàm đặt ảnh chính (Sẽ cần dùng cho Frontend sau này)
  async setPrimary(menuItemId: string, photoId: string) {
    // Reset tất cả ảnh của món này về false
    await this.photoRepo.update({ menuItemId }, { isPrimary: false });
    // Set ảnh được chọn thành true
    await this.photoRepo.update({ id: photoId }, { isPrimary: true });
    return { success: true };
  }

  // 4. Hàm xóa ảnh
  async remove(id: string) {
    const photo = await this.photoRepo.findOne({ where: { id } });
    if (!photo) throw new NotFoundException('Không tìm thấy ảnh');
    
    // Lưu ý: Ở đây bạn có thể thêm logic xóa file vật lý trong thư mục uploads nếu muốn
    return this.photoRepo.remove(photo);
  }
}