import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min, Max, IsBoolean } from 'class-validator';
import type { MenuItemQueryDto as IMenuItemQueryDto } from '../../../shared/types/menu';

export class MenuItemQueryDto implements IMenuItemQueryDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsUUID('4', { message: 'categoryId phải là UUID hợp lệ' })
  categoryId?: string;

  @IsOptional()
  @IsEnum(['available', 'unavailable', 'sold_out'], {
    message: 'status phải là available | unavailable | sold_out',
  })
  status?: 'available' | 'unavailable' | 'sold_out';

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  chefRecommended?: boolean;

  @IsOptional()
  @IsEnum(['createdAt', 'price', 'popularity'], {
    message: 'sort phải là createdAt | price | popularity',
  })
  sort?: 'createdAt' | 'price' | 'popularity';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'], { message: 'order phải là ASC hoặc DESC' })
  order?: 'ASC' | 'DESC';

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const n = typeof value === 'number' ? value : parseInt(value);
    return Number.isNaN(n) ? undefined : n;
  })
  @IsInt({ message: 'page phải là số nguyên' })
  @Min(1, { message: 'page phải >= 1' })
  page?: number;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const n = typeof value === 'number' ? value : parseInt(value);
    return Number.isNaN(n) ? undefined : n;
  })
  @IsInt({ message: 'limit phải là số nguyên' })
  @Min(1, { message: 'limit phải >= 1' })
  @Max(100, { message: 'limit phải <= 100' })
  limit?: number;
}
