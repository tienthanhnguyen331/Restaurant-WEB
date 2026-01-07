import { IsEnum, IsOptional } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'])
  status?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
}