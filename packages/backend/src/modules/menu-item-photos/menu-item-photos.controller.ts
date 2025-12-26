import { Controller, Post, Param, UploadedFiles, UseInterceptors, Get, Delete } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
// 1. Nhớ import Service vào
import { MenuItemPhotosService } from './menu-item-photos.service'; 

@Controller('admin/menu/items/:itemId/photos')
export class MenuItemPhotosController {
  
  // 2. PHẢI CÓ CONSTRUCTOR NÀY
  constructor(private readonly photosService: MenuItemPhotosService) {}

  @Get()
  async findAll(@Param('itemId') itemId: string) {
    return this.photosService.findAllByItem(itemId);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: diskStorage({
      destination: './uploads/menu-items',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new Error('Chỉ chấp nhận file ảnh!'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
  }))
  async uploadPhotos(@Param('itemId') itemId: string, @UploadedFiles() files: Express.Multer.File[]) {
    // 3. Bây giờ this.photosService sẽ không còn lỗi nữa
    const photos = await Promise.all(
      files.map(file => 
        this.photosService.create({
          menuItemId: itemId,
          url: `/uploads/menu-items/${file.filename}`,
          isPrimary: false
        })
      )
    );
    
    return { itemId, uploadedCount: files.length, photos };
  }
  // Xóa ảnh theo id
  @Delete(':photoId')
  async removePhoto(@Param('photoId') photoId: string) {
    await this.photosService.remove(photoId);
    return { success: true };
  }
}