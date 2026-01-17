import { IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsString({ message: 'fullName phải là chuỗi ký tự' })
  @MinLength(2, { message: 'fullName phải có ít nhất 2 ký tự' })
  @MaxLength(100, { message: 'fullName không được vượt quá 100 ký tự' })
  @Matches(/^[a-zA-ZÀ-ỹ\s]+$/, { message: 'fullName chỉ được chứa chữ cái và khoảng trắng' })
  fullName: string;

  @IsOptional()
  @IsString({ message: 'displayName phải là chuỗi ký tự' })
  @MinLength(2, { message: 'displayName phải có ít nhất 2 ký tự' })
  @MaxLength(50, { message: 'displayName không được vượt quá 50 ký tự' })
  displayName?: string;
}
