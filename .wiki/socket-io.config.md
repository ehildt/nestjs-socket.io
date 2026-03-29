# SocketIOServerConfig

Configuration object for Socket.IO server.

## Type

```typescript
type SocketIOServerConfig = {
  port: number;
  opts?: Partial<ServerOptions>;
};
```

## Properties

| Property | Type                      | Required | Description                          |
| -------- | ------------------------- | -------- | ------------------------------------ |
| `port`   | `number`                  | Yes      | Port number for the Socket.IO server |
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
  port: 8080,
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
  port: 8080,
  opts: {
    adapter: createAdapter(
      createClient({ host: "localhost", port: 6379 }),
      createClient({ host: "localhost", port: 6379 })
    ),
  },
};
```
