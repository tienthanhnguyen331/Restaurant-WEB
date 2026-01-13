import { WebSocketGateway, WebSocketServer, SubscribeMessage, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { KitchenService } from './kitchen.service';

@WebSocketGateway({ namespace: '/kitchen' })
export class KitchenGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly kitchenService: KitchenService) {}

  handleConnection(client: Socket) {
    console.log(`Kitchen client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Kitchen client disconnected: ${client.id}`);
  }

  // Notify kitchen when waiter sends order to kitchen
  notifyOrderToKitchen(order: any) {
    this.server.emit('orderToKitchen', order);
  }

  @SubscribeMessage('joinKitchenRoom')
  handleJoinKitchenRoom(client: Socket, data: any) {
    client.join('kitchens');
    console.log(`Kitchen ${client.id} joined kitchen room`);
  }
}
