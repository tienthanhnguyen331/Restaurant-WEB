import { IsEmail, IsString } from 'class-validator';

export class ChangeEmailDto {
  @IsEmail({}, { message: 'Email mới không hợp lệ' })
  newEmail: string;

  @IsString({ message: 'password phải là chuỗi ký tự' })
  password: string;
}
