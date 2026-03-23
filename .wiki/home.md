# @ehildt/nestjs-socket.io

A NestJS module for Socket.IO integration with room management and event handling.

## Installation

```bash
npm install @ehildt/nestjs-socket.io
npm install @nestjs/common socket.io joi
```

## Peer Dependencies

- `@nestjs/common` ^11.1.17
- `socket.io` ^4.8.1
- `joi` ^18.0.2

## Usage

### 1. Create a ConfigService

This library does not provide an adapter that reads from environment variables. You are free to create your config service however you want - using `@nestjs/config`, `process.env` directly, or any other configuration source.

```typescript
import { Injectable } from "@nestjs/common";
import { CacheReturnValue } from "@ehildt/nestjs-config-factory/cache-return-value";
import { SocketIOConfigSchema } from "@ehildt/nestjs-socket.io";
import Joi from "joi";

@Injectable()
export class SocketIOConfigService {
  @CacheReturnValue(SocketIOConfigSchema)
  get config() {
    return {
      event: "vision",
      port: parseInt(process.env.SOCKET_IO_PORT || "8080"),
      opts: {
        maxHttpBufferSize: parseInt(
          process.env.SOCKET_IO_MAX_HTTP_BUFFER_SIZE || "262144"
        ),
        cleanupEmptyChildNamespaces:
          process.env.SOCKET_IO_CLEANUP_EMPTY_CHILD_NAMESPACES === "true",
        transports: (
          process.env.SOCKET_IO_TRANSPORTS || "websocket,polling,webtransport"
        ).split(","),
        connectTimeout: parseInt(
          process.env.SOCKET_IO_CONNECT_TIMEOUT || "30000"
        ),
        pingInterval: parseInt(process.env.SOCKET_IO_PING_INTERVAL || "25000"),
        pingTimeout: parseInt(process.env.SOCKET_IO_PING_TIMEOUT || "5000"),
        allowEIO3: process.env.SOCKET_IO_ALLOW_EIO3 === "true",
        cors: {
          origin: process.env.SOCKET_IO_CORS_ORIGIN || "*",
          credentials: process.env.SOCKET_IO_CORS_CREDENTIALS !== "false",
          methods: (process.env.SOCKET_IO_CORS_METHODS || "GET,POST").split(
            ","
          ),
        },
      },
    };
  }
}
```

### 2. Register with ConfigFactoryModule

```typescript
import { Module } from "@nestjs/common";
import { ConfigFactoryModule } from "@ehildt/nestjs-config-factory/config-factory";
import { SocketIOModule } from "@ehildt/nestjs-socket.io";
import { SocketIOConfigService } from "./socket-io-config.service";

@Module({
  imports: [
    ConfigFactoryModule.forRoot({
      global: true,
      providers: [SocketIOConfigService],
    }),
    SocketIOModule.registerAsync({
      global: true,
      inject: [SocketIOConfigService],
      useFactory: async (configService: SocketIOConfigService) =>
        configService.config,
    }),
  ],
})
export class AppModule {}
```

### 3. Use SocketIOService in your controllers/services

```typescript
import { Injectable } from "@nestjs/common";
import { SocketIOService } from "@ehildt/nestjs-socket.io";

@Injectable()
export class MyService {
  constructor(private readonly socketService: SocketIOService) {}

  broadcast(message: string) {
    this.socketService.emit("my-event", { message });
  }

  sendToRoom(room: string, message: string) {
    this.socketService.emitTo("my-event", room, { message });
  }
}
```

## API Reference

- [SocketIOConfig](./socket-io-config.md) - Configuration type and schema
- [SocketIOService](./socket-ioservice.md) - Room management and event handling
- [SocketIOModule](./socket-iomodule.md) - Dynamic module for NestJS
