import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WaiterService } from './waiter.service';

@WebSocketGateway({ namespace: '/waiter' })
export class WaiterGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly waiterService: WaiterService) {}

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
}
