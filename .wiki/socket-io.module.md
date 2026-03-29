# SocketIOModule

Dynamic NestJS module for Socket.IO integration.

## Overview

`SocketIOModule` provides Socket.IO functionality to your NestJS application. It creates and manages a Socket.IO server instance and exports the `SocketIOService` for your application to use.

## registerAsync(options: SocketIOModuleProps): DynamicModule

Creates a dynamic module that registers the Socket.IO server.

### Parameters

```typescript
type SocketIOModuleProps = {
  global?: boolean;        // Make module global (default: false)
  inject?: any[];          // Dependencies to inject into useFactory
  useFactory: () => Promise<SocketIOServerConfig> | SocketIOServerConfig;
};
```

### Basic Usage

```typescript
import { Module } from "@nestjs/common";
import { SocketIOModule } from "@ehildt/nestjs-socket.io";

@Module({
  imports: [
    SocketIOModule.registerAsync({
      useFactory: () => ({
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
      useFactory: () => ({
        port: 8080,
        opts: { cors: { origin: "*" } },
      }),
    }),
  ],
})
export class AppModule {}
// SocketIOService is now available in all modules without importing
```

## Exports

| Export            | Type   | Description                                       |
| ----------------- | ------ | ------------------------------------------------- |
| `SocketIOService` | Class  | Service for room management and event handling    |

## Complete Example

### 1. Create your config service

```typescript
// socket-io-config.service.ts
import { Injectable } from "@nestjs/common";
import { SocketIOServerConfig } from "@ehildt/nestjs-socket.io";

@Injectable()
export class SocketIOConfigService {
  get config(): SocketIOServerConfig {
    return {
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
import { SocketIOModule, SocketIOConfigService } from "@ehildt/nestjs-socket.io";

@Module({
  imports: [
    SocketIOModule.registerAsync({
      global: true,
      inject: [SocketIOConfigService],
      useFactory: (configService: SocketIOConfigService) => configService.config,
    }),
  ],
})
export class AppModule {}
```

### 3. Attach Socket.IO server in main.ts

**Express:**
```typescript
// main.ts
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SocketIOService } from "@ehildt/nestjs-socket.io";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.init();

  const httpServer = app.getHttpServer();
  const socketIOService = app.get(SocketIOService);
  socketIOService.server = new (await import("socket.io")).Server(httpServer);

  await app.listen(3000);
}
bootstrap();
```

**Fastify:**
```typescript
// main.ts
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import fastifySocketIO from "fastify-socket.io";
import { AppModule } from "./app.module";
import { SocketIOService } from "@ehildt/nestjs-socket.io";

void (async () => {
  const adapter = new FastifyAdapter();
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter);

  // Register fastify-socket.io plugin
  await app.register(fastifySocketIO as any);

  // Get the Fastify instance and access the Socket.IO server
  const fastifyInstance = app.getHttpAdapter().getInstance();
  const socketIOService = app.get(SocketIOService);
  socketIOService.server = (fastifyInstance as any).io;

  await app.listen({ port: 3000 });
})();
```

### 4. Use in any service

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
