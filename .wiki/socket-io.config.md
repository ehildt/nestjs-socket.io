# SocketIOServerConfig

Configuration object for Socket.IO server.

## Type

```typescript
type SocketIOServerConfig = {
  port?: number;
  opts?: Partial<ServerOptions>;
};
```

## Properties

| Property | Type                      | Required | Description                          |
| -------- | ------------------------- | -------- | ------------------------------------ |
| `port`   | `number`                  | No       | Port number for the Socket.IO server (not needed when attaching to HTTP server) |
| `opts`   | `Partial<ServerOptions>` | No       | Socket.IO server options             |

### ServerOptions

The `opts` property accepts all [Socket.IO ServerOptions](https://socket.io/docs/v4/server-options/) including:

| Property                      | Type          | Default                                    | Description                   |
| ----------------------------- | ------------- | ------------------------------------------ | ----------------------------- |
| `maxHttpBufferSize`           | `number`      | `1e6` (1 MB)                               | Max size of HTTP buffer       |
| `cleanupEmptyChildNamespaces` | `boolean`     | `false`                                    | Auto-cleanup empty namespaces |
| `transports`                  | `string[]`    | `['polling', 'websocket']`                | Allowed transport protocols   |
| `connectTimeout`              | `number`      | `45000`                                    | Connection timeout in ms      |
| `pingInterval`                | `number`      | `25000`                                    | Ping interval in ms           |
| `pingTimeout`                 | `number`      | `20000`                                    | Ping timeout in ms            |
| `allowEIO3`                   | `boolean`     | `false`                                    | Allow Engine.IO v3 protocol   |
| `cors`                        | `CorsOptions` | See below                                  | CORS configuration            |
| `serveClient`                 | `boolean`     | `true`                                     | Serve client files            |
| `path`                        | `string`      | `/socket.io/`                              | Server path                   |
| `adapter`                     | `Adapter`     | In-memory adapter                          | Custom adapter (e.g., Redis)  |
| `parser`                      | `Parser`      | `socket.io-parser`                         | Custom parser                 |
| `httpCompression`             | `object`      | `true`                                     | HTTP compression settings     |
| `perMessageDeflate`           | `object`      | `false`                                    | Per-message compression       |
| `allowUpgrades`               | `boolean`     | `true`                                     | Allow transport upgrades      |
| `upgradeTimeout`              | `number`      | `10000`                                    | Upgrade timeout in ms         |
| `wsEngine`                    | `object`      | `ws.Server`                                | WebSocket engine              |

For the complete list, see [Socket.IO Server Options](https://socket.io/docs/v4/server-options/).

### CORS Options

```typescript
cors: {
  origin: string | string[] | RegExp | Function | boolean;  // Default: '*'
  credentials: boolean;  // Default: true
  methods: string[];  // Default: ['GET', 'POST']
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge: number;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}
```

For more details, see [Socket.IO CORS documentation](https://socket.io/docs/v4/handling-cors/).

## Validation Schema

Use `SocketIOConfigSchema` with Joi for validation:

```typescript
import { SocketIOConfigSchema } from "@ehildt/nestjs-socket.io";

const result = SocketIOConfigSchema.validate(config);
if (result.error) {
  console.error(result.error);
}
```

## Example

```typescript
const config: SocketIOServerConfig = {
  opts: {
    maxHttpBufferSize: 1e6,
    transports: ["websocket", "polling"],
    cors: {
      origin: "https://example.com",
      credentials: true,
      methods: ["GET", "POST"],
    },
  },
};
```

## Example with Redis Adapter

```typescript
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const config: SocketIOServerConfig = {
  opts: {
    // Two clients required: first for publishing, second for subscribing
    adapter: createAdapter(
      createClient({ host: "localhost", port: 6379 }),
      createClient({ host: "localhost", port: 6379 })
    ),
  },
};
```

## Using Environment Variables with Config Adapter

For production applications, it's common to configure Socket.IO using environment variables. Here's an example pattern using a config adapter:

### 1. Create the Config Adapter

```typescript
// socket-io-config.adapter.ts
import { SocketIOServerConfig } from "@ehildt/nestjs-socket.io";

export function SocketIOConfigAdapter(env = process.env): SocketIOServerConfig {
  return {
    opts: {
      maxHttpBufferSize: Number(env.SOCKET_IO_MAX_HTTP_BUFFER_SIZE ?? 262144),
      transports: (env.SOCKET_IO_TRANSPORTS?.split(",") ?? [
        "websocket",
        "polling",
      ]) as Array<"websocket" | "polling" | "webtransport">,
      cors: {
        origin: env.SOCKET_IO_CORS_ORIGIN ?? "*",
        credentials: env.SOCKET_IO_CORS_CREDENTIALS === "true",
        methods: (env.SOCKET_IO_CORS_METHODS?.split(",") ?? [
          "GET",
          "POST",
        ]) as Array<"GET" | "POST">,
      },
      pingInterval: Number(env.SOCKET_IO_PING_INTERVAL ?? 25000),
      pingTimeout: Number(env.SOCKET_IO_PING_TIMEOUT ?? 5000),
      connectTimeout: Number(env.SOCKET_IO_CONNECT_TIMEOUT ?? 45000),
    },
  };
}
```

### 2. Create the Config Service (Optional - for validation/caching)

```typescript
// socket-io-config.service.ts
import { CacheReturnValue } from "@ehildt/nestjs-config-factory/cache-return-value";
import { SocketIOConfigSchema, SocketIOServerConfig } from "@ehildt/nestjs-socket.io";
import { Injectable } from "@nestjs/common";

import { SocketIOConfigAdapter } from "./socket-io-config.adapter.js";

@Injectable()
export class SocketIOConfigService {
  @CacheReturnValue(SocketIOConfigSchema)
  get config(): SocketIOServerConfig {
    return SocketIOConfigAdapter();
  }
}
```

### 3. Register in Your Module

```typescript
// app.module.ts
import { Module } from "@nestjs/common";
import { SocketIOModule, SocketIOConfigService } from "@ehildt/nestjs-socket.io";

@Module({
  imports: [
    SocketIOModule.registerAsync({
      inject: [SocketIOConfigService],
      useFactory: (configService: SocketIOConfigService) => configService.config,
    }),
  ],
})
export class AppModule {}
```

### Environment Variables

| Variable | Default | Description |
| -------- | ------- |-------------|
| `SOCKET_IO_MAX_HTTP_BUFFER_SIZE` | 262144 | Max HTTP buffer size |
| `SOCKET_IO_TRANSPORTS` | websocket,polling | Allowed transport protocols |
| `SOCKET_IO_CORS_ORIGIN` | * | CORS origin |
| `SOCKET_IO_CORS_CREDENTIALS` | false | Allow credentials |
| `SOCKET_IO_CORS_METHODS` | GET,POST | Allowed CORS methods |
| `SOCKET_IO_PING_INTERVAL` | 25000 | Ping interval in ms |
| `SOCKET_IO_PING_TIMEOUT` | 5000 | Ping timeout in ms |
| `SOCKET_IO_CONNECT_TIMEOUT` | 45000 | Connection timeout in ms |
