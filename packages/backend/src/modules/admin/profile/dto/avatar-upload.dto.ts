import { IsOptional } from 'class-validator';

export class AvatarUploadDto {
  @IsOptional()
  file?: Express.Multer.File;
}
