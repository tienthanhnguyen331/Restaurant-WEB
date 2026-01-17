import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { UserRole } from '../../../user/user.entity';

export class CreateStaffDto {
  @IsNotEmpty({ message: 'Vui lòng nhập họ tên đầy đủ' })
  @IsString({ message: 'Họ tên phải là chuỗi ký tự' })
  @MinLength(2, { message: 'Họ tên phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'Họ tên không được vượt quá 100 ký tự' })
  @Matches(/^[a-zA-ZÀ-ỹ\s]+$/, {
    message: 'Họ tên chỉ được chứa chữ cái và khoảng trắng',
  })
  fullName: string;

  @IsNotEmpty({ message: 'Vui lòng nhập email' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @IsNotEmpty({ message: 'Vui lòng nhập mật khẩu' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @MaxLength(50, { message: 'Mật khẩu không được vượt quá 50 ký tự' })
  @Matches(/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/, {
    message: 'Mật khẩu phải chứa chữ hoa, chữ thường, và số',
  })
  password: string;

  @IsNotEmpty({ message: 'Vui lòng chọn vai trò' })
  @IsEnum([UserRole.WAITER, UserRole.KITCHEN_STAFF, UserRole.ADMIN], {
    message: 'Vai trò phải là WAITER, KITCHEN_STAFF hoặc ADMIN',
  })
  role: UserRole;
}
