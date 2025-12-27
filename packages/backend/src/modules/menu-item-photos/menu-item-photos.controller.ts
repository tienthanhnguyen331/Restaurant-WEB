import { Controller, Post, Param, UploadedFiles, UseInterceptors, Get, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { MenuItemPhotosService } from './menu-item-photos.service'; 

@Controller('admin/menu/items/:itemId/photos')
export class MenuItemPhotosController {
  
  constructor(
    private readonly photosService: MenuItemPhotosService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Get()
  async findAll(@Param('itemId') itemId: string) {
    return this.photosService.findAllByItem(itemId);
  }

  @Get('test-upload')
  testUploadConfig() {
    return {
      status: 'ok',
      cloudinaryConfigured: !!process.env.CLOUDINARY_CLOUD_NAME,
      env: process.env.NODE_ENV
    };
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10, {
    storage: memoryStorage(), // Use memory storage to get file buffer
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
        return cb(new Error('ONLY_IMAGES_ALLOWED'), false);
      }
      cb(null, true);
    },
    limits: { fileSize: 4 * 1024 * 1024 } // Reduce to 4MB to be safe on Vercel
  }))
  async uploadPhotos(@Param('itemId') itemId: string, @UploadedFiles() files: Express.Multer.File[]) {
    console.log(`Received upload request for item ${itemId}. Files count: ${files?.length}`);
    
    if (!files || files.length === 0) {
      throw new HttpException('No files uploaded', HttpStatus.BAD_REQUEST);
    }

    try {
      const photos = await Promise.all(
        files.map(async (file) => {
          console.log(`Uploading file: ${file.originalname} (${file.size} bytes)`);
          // Upload to Cloudinary
          const result = await this.cloudinaryService.uploadFile(file);
          console.log(`Upload success: ${result.secure_url}`);
          
          // Save to DB with Cloudinary URL
          return this.photosService.create({
            menuItemId: itemId,
            url: result.secure_url, // Use the secure URL from Cloudinary
            isPrimary: false
          });
        })
      );
      
      return { itemId, uploadedCount: files.length, photos };
    } catch (error) {
      console.error('Upload failed:', error);
      
      // Check for specific Cloudinary error
      if (error.message && error.message.includes('MISSING_CLOUDINARY_CREDENTIALS')) {
         throw new HttpException({
          status: HttpStatus.SERVICE_UNAVAILABLE,
          error: 'Configuration Error',
          message: 'Server is missing Cloudinary credentials. Please configure them in Vercel.',
        }, HttpStatus.SERVICE_UNAVAILABLE);
      }

      // Return specific error message to frontend
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Upload failed',
        message: error.message || 'Unknown error during upload',
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  // Xóa ảnh theo id
  @Delete(':photoId')
  async removePhoto(@Param('photoId') photoId: string) {
    await this.photosService.remove(photoId);
    return { success: true };
  }
}