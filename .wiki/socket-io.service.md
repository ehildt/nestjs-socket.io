# SocketIOService

Service for Socket.IO room management and event handling.

## Overview

`SocketIOService` is injected into your NestJS services to interact with the Socket.IO server. It provides methods for:

- Broadcasting events to all connected clients
- Sending events to specific rooms
- Room management (join/leave)
- Event subscription

## Methods

### emit\<T\>(event: string, message: T): this

Broadcasts an event to all connected clients.

```typescript
socketService.emit("notification", { title: "Hello", body: "World" });
```

### emitTo\<T\>(event: string, room: string, message: T): this

Sends an event to all clients in a specific room.

```typescript
socketService.emitTo("room-message", "room-123", { content: "Hello room!" });
```

### on\<T\>(event: string | SocketIORecord, callback?: SocketIOListener\<T\>): this

Subscribes to events from connected clients.

**Single event:**

```typescript
socketService.on("chat-message", async ({ socket, data, ack }) => {
  console.log("Received:", data);
  // Process the message
  ack(true); // Acknowledge success
});
```

**Multiple events at once:**

```typescript
socketService.on({
  joinRoom: async ({ socket, data, ack }) => {
    await socket.join(data);
    ack(true);
  },
  leaveRoom: async ({ socket, data, ack }) => {
    await socket.leave(data);
    ack(true);
  },
});
```

### joinRoom(listener: SocketListener): Promise\<void\>

Built-in handler for clients to join a room. Clients emit `joinRoom` with the room name.

```typescript
// Client-side
socket.emit("joinRoom", "room-123", (ok, error) => {
  if (ok) console.log("Joined room");
  else console.error(error);
});
```

### leaveRoom(listener: SocketListener): Promise\<void\>

Built-in handler for clients to leave a room. Clients emit `leaveRoom` with the room name.

```typescript
// Client-side
socket.emit("leaveRoom", "room-123", (ok, error) => {
  if (ok) console.log("Left room");
  else console.error(error);
});
```

### server: Server

Access to the underlying Socket.IO server instance.

```typescript
const ioServer = socketService.server;
// Use any Socket.IO server methods
```

## SocketListener Interface

```typescript
type SocketListener = {
  data: string;
  ack: (ok: boolean, error?: string) => void;
  socket: Socket;
};
```

## SocketIOListener Interface

```typescript
type SocketIOListener<S = Socket, T = any> = (obj: {
  socket: S;
  data: T;
  ack: (ok: boolean, error?: string) => void;
}) => Promise<void> | void;
```

## Example: Chat Service

```typescript
import { Injectable } from "@nestjs/common";
import { SocketIOService } from "@ehildt/nestjs-socket.io";

@Injectable()
export class ChatService {
  constructor(private readonly socketService: SocketIOService) {
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.socketService.on({
      joinRoom: async ({ socket, data, ack }) => {
        await socket.join(data);
        this.socketService.emitTo("userJoined", data, {
          userId: socket.id,
          room: data,
        });
        ack(true);
      },
      leaveRoom: async ({ socket, data, ack }) => {
        await socket.leave(data);
        this.socketService.emitTo("userLeft", data, {
          userId: socket.id,
          room: data,
        });
        ack(true);
      },
    });

    this.socketService.on("chatMessage", async ({ socket, data, ack }) => {
      this.socketService.emitTo("newMessage", data.room, {
        userId: socket.id,
        message: data.message,
        timestamp: new Date(),
      });
      ack(true);
    });
  }

  sendSystemMessage(room: string, message: string) {
    this.socketService.emitTo("systemMessage", room, { message });
  }
}
```
