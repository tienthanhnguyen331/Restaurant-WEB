import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CategoryQueryDto {
  /**
   * Tìm kiếm theo tên danh mục
   */
  @IsOptional()
  @IsString()
  search?: string;

  /**
   * Lọc theo trạng thái danh mục
   */
  @IsOptional()
  @IsEnum(['active', 'inactive'], {
    message: 'Trạng thái phải là active hoặc inactive',
  })
  status?: 'active' | 'inactive';

  /**
   * Trường dùng để sắp xếp (mặc định là display_order)
   */
  @IsOptional()
  @IsString()
  sort?: string = 'displayOrder';

  /**
   * Hướng sắp xếp (ASC hoặc DESC)
   */
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'ASC';

  /**
   * Số trang hiện tại
   */
  @IsOptional()
  @Type(() => Number) // Chuyển đổi từ chuỗi sang số
  @IsInt()
  @Min(1)
  page?: number = 1;

  /**
   * Số lượng bản ghi trên mỗi trang
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}