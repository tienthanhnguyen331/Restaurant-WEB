import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WaiterService } from './waiter.service';

@WebSocketGateway({ namespace: '/waiter' })
export class WaiterGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly waiterService: WaiterService) {}

  // Notify waiters when order status changes (for real-time update)
  notifyOrderStatusUpdate(orderId: string, status: string) {
    this.server.emit('order_status_update', { orderId, status });
  }

  handleConnection(client: Socket) {
    console.log(`Waiter client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Waiter client disconnected: ${client.id}`);
  }

  // Notify waiters when a new order is placed
  notifyNewOrder(order: any) {
    this.server.emit('newOrder', order);
  }

  // Notify waiters when kitchen marks order as ready
  notifyOrderReady(orderId: string) {
    this.server.emit('orderReady', { orderId });
  }

  @SubscribeMessage('joinWaiterRoom')
  handleJoinWaiterRoom(client: Socket, data: any) {
    client.join('waiters');
    console.log(`Waiter ${client.id} joined waiter room`);
  }

  @SubscribeMessage('request_invoice')
  handleRequestInvoice(client: Socket, data: { orderId: string; tableId: string | number }) {
    console.log('[WAITER_GATEWAY] Nhận request_invoice từ guest:', data);
    // Broadcast cho tất cả waiter
    this.server.emit('request_invoice', data);
    console.log('[WAITER_GATEWAY] Đã emit request_invoice cho waiter:', data);
  }
}
