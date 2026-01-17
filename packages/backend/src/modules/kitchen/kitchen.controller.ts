import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { KitchenService } from './kitchen.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '../user/user.entity';
import { RolesGuard } from '@/src/common/guards/roles.guard';
import { Roles } from '@/src/common/decorators/roles.decorator';

@Controller('kitchen')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.KITCHEN_STAFF)
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  @Get('orders')
  async getOrders() {
    return this.kitchenService.getOrders();
  }

  @Post('orders/:id/preparing')
  async setPreparing(@Param('id') orderId: string) {
    return this.kitchenService.setPreparing(orderId);
  }

  @Post('orders/:id/ready')
  async setReady(@Param('id') orderId: string) {
    return this.kitchenService.setReady(orderId);
  }
}
