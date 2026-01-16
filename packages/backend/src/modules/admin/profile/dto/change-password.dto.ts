import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'oldPassword phải là chuỗi ký tự' })
  oldPassword: string;

  @IsString({ message: 'newPassword phải là chuỗi ký tự' })
  @MinLength(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
  })
  newPassword: string;

  @IsString({ message: 'confirmNewPassword phải là chuỗi ký tự' })
  confirmNewPassword: string;
}
