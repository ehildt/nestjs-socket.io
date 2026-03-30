# @ehildt/nestjs-socket.io

A lightweight NestJS wrapper around [Socket.IO](https://socket.io/docs/v4/server-api/) for room management and event handling.

This library provides a thin NestJS integration layer around Socket.IO. For the full Socket.IO server API, see the [official Socket.IO documentation](https://socket.io/docs/v4/server-api/).

## Installation

```bash
npm install @ehildt/nestjs-socket.io
npm install @nestjs/common socket.io joi
```

For Fastify support:
```bash
npm install fastify-socket.io
```

## Peer Dependencies

- `@nestjs/common` ^11.1.17
- `socket.io` ^4.8.1
- `joi` ^18.0.2

## Quick Start

### 1. Register the module

```typescript
import { Module } from "@nestjs/common";
import { SocketIOModule } from "@ehildt/nestjs-socket.io";

@Module({
  imports: [
    SocketIOModule.registerAsync({
      useFactory: () => ({
        opts: { cors: { origin: "*" } },
      }),
    }),
  ],
})
export class AppModule {}
```

### 2. Attach Socket.IO server in main.ts

**Express:**
```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SocketIOService } from "@ehildt/nestjs-socket.io";

void (async () => {
  const app = await NestFactory.create(AppModule);
  await app.init();

  const httpServer = app.getHttpServer();
  const socketIOService = app.get(SocketIOService);
  socketIOService.io = new (await import("socket.io")).Server(httpServer, socketIOService.config.opts);

  await app.listen(3000);
})();
```

**Fastify:**
```typescript
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import fastifySocketIO from "fastify-socket.io";
import { AppModule } from "./app.module";
import { SocketIOService } from "@ehildt/nestjs-socket.io";

void (async () => {
  const adapter = new FastifyAdapter();
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, adapter);

  const socketIOService = app.get(SocketIOService);
  await app.register(fastifySocketIO as any, socketIOService.config.opts);

  const fastifyInstance = app.getHttpAdapter().getInstance();
  socketIOService.io = (fastifyInstance as any).io;

  await app.listen({ port: 3000 });
})();
```

### 3. Use SocketIOService

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

- [SocketIOConfig](./socket-io.config.md) - Configuration type and schema
- [SocketIOService](./socket-io.service.md) - Room management and event handling
- [SocketIOModule](./socket-io.module.md) - Dynamic module for NestJS
