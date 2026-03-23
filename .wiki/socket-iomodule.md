# SocketIOModule

Dynamic NestJS module for Socket.IO integration.

## Overview

`SocketIOModule` provides Socket.IO functionality to your NestJS application. It creates and manages a Socket.IO server instance and exports the `SocketIOService` for your application to use.

## registerAsync(options: SocketIOModuleProps): DynamicModule

Creates a dynamic module that registers the Socket.IO server.

### Parameters

```typescript
type SocketIOModuleProps = {
  global?: boolean; // Make module global (default: undefined/false)
  inject?: Array<any>; // Dependencies to inject into useFactory
  useFactory: SocketIOConfigFactory; // Factory function that returns config
};
```

```typescript
type SocketIOConfigFactory = (...deps: Array<any>) => Promise<SocketIOConfig>;
```

### Basic Usage

```typescript
import { Module } from "@nestjs/common";
import { SocketIOModule } from "@ehildt/nestjs-socket.io";

@Module({
  imports: [
    SocketIOModule.registerAsync({
      useFactory: () => ({
        event: "my-app",
        port: 8080,
        opts: {
          transports: ["websocket", "polling"],
        },
      }),
    }),
  ],
})
export class AppModule {}
```

### With Dependencies

```typescript
import { Module } from "@nestjs/common";
import { SocketIOModule } from "@ehildt/nestjs-socket.io";
import { ConfigService } from "./config.service";

@Module({
  imports: [
    SocketIOModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        event: "my-app",
        port: config.get("SOCKET_IO_PORT"),
        opts: config.get("socketOpts"),
      }),
    }),
  ],
})
export class AppModule {}
```

### Global Module

```typescript
@Module({
  imports: [
    SocketIOModule.registerAsync({
      global: true,
      inject: [SocketIOConfigService],
      useFactory: (configService: SocketIOConfigService) =>
        configService.config,
    }),
  ],
})
export class AppModule {}

// Now SocketIOService is available in all modules without importing
```

## Exports

When registered, the module exports:

| Export             | Type   | Description                                       |
| ------------------ | ------ | ------------------------------------------------- |
| `SOCKET_IO_SERVER` | Symbol | Injection token for the Socket.IO Server instance |
| `SocketIOService`  | Class  | Service for room management and event handling    |

## Complete Example

### 1. Create your config service

```typescript
// socket-io-config.service.ts
import { Injectable } from "@nestjs/common";
import { SocketIOConfig, SocketIOConfigSchema } from "@ehildt/nestjs-socket.io";

@Injectable()
export class SocketIOConfigService {
  get config(): SocketIOConfig {
    return {
      event: "my-app",
      port: parseInt(process.env.SOCKET_IO_PORT || "8080"),
      opts: {
        maxHttpBufferSize: parseInt(
          process.env.SOCKET_IO_MAX_HTTP_BUFFER_SIZE || "262144"
        ),
        transports: (
          process.env.SOCKET_IO_TRANSPORTS || "websocket,polling"
        ).split(","),
        cors: {
          origin: process.env.SOCKET_IO_CORS_ORIGIN || "*",
          credentials: process.env.SOCKET_IO_CORS_CREDENTIALS !== "false",
          methods: ["GET", "POST"],
        },
      },
    };
  }
}
```

### 2. Register the module

```typescript
// app.module.ts
import { Module } from "@nestjs/common";
import {
  SocketIOModule,
  SocketIOConfigService,
} from "@ehildt/nestjs-socket.io";

@Module({
  imports: [
    SocketIOModule.registerAsync({
      global: true,
      inject: [SocketIOConfigService],
      useFactory: (configService: SocketIOConfigService) =>
        configService.config,
    }),
  ],
})
export class AppModule {}
```

### 3. Use in any service

```typescript
// notifications.service.ts
import { Injectable } from "@nestjs/common";
import { SocketIOService } from "@ehildt/nestjs-socket.io";

@Injectable()
export class NotificationsService {
  constructor(private readonly socketService: SocketIOService) {}

  notifyUser(userId: string, notification: any) {
    this.socketService.emitTo("notification", userId, notification);
  }

  notifyAll(notification: any) {
    this.socketService.emit("notification", notification);
  }
}
```
