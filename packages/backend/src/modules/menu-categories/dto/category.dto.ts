import { IsString, IsOptional, IsInt, Min, Length, IsEnum } from 'class-validator';

export class CreateMenuCategoryDto {
  @IsString()
  @Length(2, 50, { message: 'Tên danh mục phải từ 2 đến 50 ký tự' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0, { message: 'Thứ tự hiển thị không được là số âm' })
  displayOrder: number;
}

export class UpdateMenuCategoryDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive';
}