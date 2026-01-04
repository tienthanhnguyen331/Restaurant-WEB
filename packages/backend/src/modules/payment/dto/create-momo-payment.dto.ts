// DTO for creating MoMo payment
import { IsString, IsNumber, IsPositive } from 'class-validator';

export class CreateMomoPaymentDto {
  @IsString()
  orderId!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;
}
