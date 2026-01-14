import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { WaiterService } from './waiter.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from '../user/user.entity';
import { Roles } from '@/src/common/decorators/roles.decorator';
import { RolesGuard } from '@/src/common/guards/roles.guard';

@Controller('waiter')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.WAITER)
export class WaiterController {
  constructor(private readonly waiterService: WaiterService) {}

  @Get('orders/pending')
  async getPendingOrders() {
    return this.waiterService.getPendingOrders();
  }

  @Post('orders/:id/accept')
  async acceptOrder(@Param('id') orderId: string) {
    return this.waiterService.acceptOrder(orderId);
  }

  @Post('orders/:id/reject')
  async rejectOrder(@Param('id') orderId: string) {
    return this.waiterService.rejectOrder(orderId);
  }

  @Post('orders/:id/send-to-kitchen')
  async sendToKitchen(@Param('id') orderId: string) {
    return this.waiterService.sendToKitchen(orderId);
  }

  @Post('orders/:id/serve')
  async serveOrder(@Param('id') orderId: string) {
    return this.waiterService.serveOrder(orderId);
  }
}
