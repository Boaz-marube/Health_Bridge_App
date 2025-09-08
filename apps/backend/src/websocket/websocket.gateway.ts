import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:3000'],
    credentials: true,
  },
})
export class WebSocketGatewayService implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>(); // socketId -> userId

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);
      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('join')
  handleJoinRoom(client: Socket, userId: string) {
    this.connectedUsers.set(client.id, userId);
    client.join(`user_${userId}`);
    console.log(`User ${userId} joined room`);
  }

  // Emit appointment updates to specific user
  emitAppointmentUpdate(userId: string, data: any) {
    this.server.to(`user_${userId}`).emit('appointmentUpdated', data);
  }

  // Emit queue updates to specific user
  emitQueueUpdate(userId: string, data: any) {
    this.server.to(`user_${userId}`).emit('queueUpdated', data);
  }

  // Emit notification to specific user
  emitNotification(userId: string, data: any) {
    this.server.to(`user_${userId}`).emit('notification', data);
  }
}