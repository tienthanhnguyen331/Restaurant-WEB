import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import type {
  CreateMenuItemDto as ICreateMenuItemDto,
  MenuItemStatus,
  UpdateMenuItemDto as IUpdateMenuItemDto,
} from '@shared/types/menu';

export class CreateMenuItemDto implements ICreateMenuItemDto {
  @IsUUID('4', { message: 'categoryId phải là UUID hợp lệ' })
  categoryId: string;

  @IsString({ message: 'name phải là chuỗi' })
  @Length(2, 80, { message: 'name phải từ 2 đến 80 ký tự' })
  name: string;

  @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
  @IsNumber({}, { message: 'price phải là số' })
  @Min(0.01, { message: 'price phải > 0' })
  price: number;

  @IsOptional()
  @IsString({ message: 'description phải là chuỗi' })
  description?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const n = typeof value === 'number' ? value : parseInt(value);
    return Number.isNaN(n) ? value : n;
  })
  @IsInt({ message: 'prepTimeMinutes phải là số nguyên' })
  @Min(0, { message: 'prepTimeMinutes phải >= 0' })
  @Max(240, { message: 'prepTimeMinutes phải <= 240' })
  prepTimeMinutes?: number;

  @IsEnum(['available', 'unavailable', 'sold_out'], {
    message: 'status phải là available | unavailable | sold_out',
  })
  status: MenuItemStatus;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'isChefRecommended phải là boolean' })
  isChefRecommended?: boolean;

  @IsOptional()
  @IsArray({ message: 'modifierGroupIds phải là mảng' })
  @ArrayUnique({ message: 'modifierGroupIds không được trùng' })
  @IsUUID('4', { each: true, message: 'modifierGroupIds phải là UUID hợp lệ' })
  modifierGroupIds?: string[];
}

export class UpdateMenuItemDto implements IUpdateMenuItemDto {
  @IsOptional()
  @IsUUID('4', { message: 'categoryId phải là UUID hợp lệ' })
  categoryId?: string;

  @IsOptional()
  @IsString({ message: 'name phải là chuỗi' })
  @Length(2, 80, { message: 'name phải từ 2 đến 80 ký tự' })
  name?: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
  @IsNumber({}, { message: 'price phải là số' })
  @Min(0.01, { message: 'price phải > 0' })
  price?: number;

  @IsOptional()
  @IsString({ message: 'description phải là chuỗi' })
  description?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    const n = typeof value === 'number' ? value : parseInt(value);
    return Number.isNaN(n) ? value : n;
  })
  @IsInt({ message: 'prepTimeMinutes phải là số nguyên' })
  @Min(0, { message: 'prepTimeMinutes phải >= 0' })
  @Max(240, { message: 'prepTimeMinutes phải <= 240' })
  prepTimeMinutes?: number;

  @IsOptional()
  @IsEnum(['available', 'unavailable', 'sold_out'], {
    message: 'status phải là available | unavailable | sold_out',
  })
  status?: MenuItemStatus;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean({ message: 'isChefRecommended phải là boolean' })
  isChefRecommended?: boolean;

  @IsOptional()
  @IsArray({ message: 'modifierGroupIds phải là mảng' })
  @ArrayUnique({ message: 'modifierGroupIds không được trùng' })
  @IsUUID('4', { each: true, message: 'modifierGroupIds phải là UUID hợp lệ' })
  modifierGroupIds?: string[];
}

export class UpdateMenuItemStatusDto {
  @IsEnum(['available', 'unavailable', 'sold_out'], {
    message: 'status phải là available | unavailable | sold_out',
  })
  status: MenuItemStatus;
}
