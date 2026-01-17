import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { UserRole } from '../../../user/user.entity';

export class UpdateStaffDto {
  @IsOptional()
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  @MinLength(2, { message: 'Họ tên phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Họ tên không được vượt quá 100 ký tự' })
  @Matches(/^[a-zA-ZÀ-ỹ\s]+$/, {
    message: 'Họ tên chỉ được chứa chữ cái và khoảng trắng',
  })
  fullName?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @IsOptional()
  @IsEnum([UserRole.WAITER, UserRole.KITCHEN_STAFF, UserRole.ADMIN], {
    message: 'Vai trò phải là WAITER, KITCHEN_STAFF hoặc ADMIN',
  })
  role?: UserRole;
}
