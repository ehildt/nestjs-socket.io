# SocketIOService

Service for Socket.IO room management and event handling.

## Overview

`SocketIOService` is injected into your NestJS services to interact with the Socket.IO server. It provides methods for:

- Broadcasting events to all connected clients
- Sending events to specific rooms
- Room management (join/leave)
- Event subscription
- Access to Socket.IO server methods for advanced usage

All methods return `this` for method chaining, enabling a fluent API.

## Methods

### emit\<T\>(event: string, message: T): this

Broadcasts an event to all connected clients.

[Socket.IO Docs](https://socket.io/docs/v4/server-api/#serveremiteventname-args)

```typescript
socketService.emit("notification", { title: "Hello", body: "World" });
```

### emitTo\<T\>(event: string, room: string, message: T): this

Sends an event to all clients in a specific room.

```typescript
socketService.emitTo("room-message", "room-123", { content: "Hello room!" });
```

### on\<T\>(event: string | SocketEventMap, callback?: SocketEventHandler\<T\>): this

Subscribes to events from connected clients.

[Socket.IO Docs](https://socket.io/docs/v4/server-api/#serveroneventname-listener)

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

### joinRoom({ socket, data, ack }: SocketEventPayload): Promise\<void\>

Makes the socket join a room. Can be used programmatically or as an event handler.

[Socket.IO Docs](https://socket.io/docs/v4/server-socket-instance/#socketjoinroom)

```typescript
// As event handler (automatically responds to "joinRoom" events from clients)
socketService.on("joinRoom", socketService.joinRoom);

// Programmatic usage
socketService.on("connection", async ({ socket }) => {
  await socketService.joinRoom({
    socket,
    data: "user-room",
    ack: (ok, error) => { console.log(ok ? "Joined!" : error); }
  });
});
```

### leaveRoom({ socket, data, ack }: SocketEventPayload): Promise\<void\>

Makes the socket leave a room. Can be used programmatically or as an event handler.

[Socket.IO Docs](https://socket.io/docs/v4/server-socket-instance/#socketleaveroom)

```typescript
// As event handler (automatically responds to "leaveRoom" events from clients)
socketService.on("leaveRoom", socketService.leaveRoom);

// Programmatic usage
socketService.on("connection", async ({ socket }) => {
  await socketService.leaveRoom({
    socket,
    data: "user-room",
    ack: (ok, error) => { console.log(ok ? "Left!" : error); }
  });
});
```

### to(room: string | string[]): this

Sets a modifier for a subsequent event emission that the event will only be broadcast to clients that have joined the given room.

[Socket.IO Docs](https://socket.io/docs/v4/server-api/#servertoroom)

```typescript
socketService.to("room-123").emit("message", "Hello room!");
socketService.to(["room-1", "room-2"]).emit("message", "Hello multiple rooms!");
```

### in(room: string | string[]): this

Alias for `to()`. See documentation above.

[Socket.IO Docs](https://socket.io/docs/v4/server-api/#serverinroom)

### except(room: string | string[]): this

Sets a modifier for a subsequent event emission that the event will only be broadcast to clients that have not joined the given rooms.

[Socket.IO Docs](https://socket.io/docs/v4/server-api/#serverexceptrooms)

```typescript
// Send to all clients except those in "admin-room"
socketService.except("admin-room").emit("message", "Hello everyone!");
```

### timeout(ms: number): this

Sets a modifier for a subsequent event emission that the callback will be called with an error when the given number of milliseconds have elapsed without an acknowledgement from all targeted clients.

[Socket.IO Docs](https://socket.io/docs/v4/server-api/#servertimeoutvalue)

```typescript
socketService.timeout(5000).emit("event", (err, responses) => {
  if (err) console.log("Some clients did not acknowledge:", err);
  else console.log("All acknowledged:", responses);
});
```

### fetchSockets(cb: (sockets: Socket[]) => void): this

Returns the matching Socket instances. The callback receives an array of Socket instances.

[Socket.IO Docs](https://socket.io/docs/v4/server-api/#serverfetchsockets)

```typescript
// Get all sockets in the main namespace
socketService.fetchSockets((sockets) => {
  console.log(`Connected clients: ${sockets.length}`);
  for (const socket of sockets) {
    console.log("Socket ID:", socket.id);
  }
});

// Get all sockets in a specific room
socketService.in("room-123").fetchSockets((sockets) => {
  console.log(`Clients in room-123: ${sockets.length}`);
});
```

### socketsJoin(rooms: string | string[], cb?: () => void): this

Makes all Socket instances join the specified rooms.

[Socket.IO Docs](https://socket.io/docs/v4/server-api/#serversocketsjoinrooms)

```typescript
// Make all clients join a room
socketService.socketsJoin("broadcast-room");

// Make all clients in a room join another room
socketService.in("room-1").socketsJoin("room-2");

// With callback
socketService.socketsJoin("new-room", () => {
  console.log("All sockets joined new-room");
});
```

### socketsLeave(rooms: string | string[], cb?: () => void): this

Makes all Socket instances leave the specified rooms.

[Socket.IO Docs](https://socket.io/docs/v4/server-api/#serversocketsleaverooms)

```typescript
// Make all clients leave a room
socketService.socketsLeave("old-room");

// Make all clients in a room leave another room
socketService.in("room-1").socketsLeave("room-2");
```

### disconnectSockets(close?: boolean, cb?: () => void): this

Makes the matching Socket instances disconnect.

[Socket.IO Docs](https://socket.io/docs/v4/server-api/#serverdisconnectsocketsclose)

```typescript
// Disconnect all clients (without closing the underlying connection)
socketService.disconnectSockets();

// Disconnect all clients and close the underlying connection
socketService.disconnectSockets(true);

// With callback
socketService.disconnectSockets(() => {
  console.log("All sockets disconnected");
});
```

### close(cb?: () => void): this

Closes the Socket.IO server and disconnects all clients.

[Socket.IO Docs](https://socket.io/docs/v4/server-api/#serverclosecallback)

```typescript
socketService.close(() => {
  console.log("Server closed");
});
```

### of(nsp: string, cb: (ns: Namespace) => void): this

Initializes and retrieves the given Namespace by its pathname identifier. The callback receives the Namespace instance.

[Socket.IO Docs](https://socket.io/docs/v4/server-api/#serverofnsp)

```typescript
socketService.of("/admin", (ns) => {
  ns.on("connection", (socket) => {
    console.log("Admin connected:", socket.id);
  });
});
```

### use(fn: (socket: Socket, next: (err?: Error) => void) => void, cb?: (server: Server) => void): this

Registers a middleware for the main namespace.

[Socket.IO Docs](https://socket.io/docs/v4/server-api/#serverusefn)

```typescript
socketService.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    next();
  } else {
    next(new Error("unauthorized"));
  }
}, (server) => {
  console.log("Middleware registered");
});
```

### server: Server

Access to the underlying Socket.IO server instance.

```typescript
const ioServer = socketService.server;
// Use any Socket.IO server methods directly
```

## Chaining Example

All methods return `this` for chaining:

```typescript
socketService
  .to("room-1")
  .except("room-2")
  .timeout(5000)
  .emit("event", { data: "message" });
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

  broadcastToAllRooms(message: string) {
    this.socketService.emit("broadcast", { message });
  }

  notifyAdmins(message: string) {
    this.socketService.except("user-room").emit("adminMessage", { message });
  }
}
```
