# SocketIOConfig

Configuration object for Socket.IO server.

## Type

```typescript
type SocketIOConfig = {
  port: number;
  event: string;
  opts: Partial<ServerOptions>;
};
```

## Properties

| Property | Type                     | Required | Description                          |
| -------- | ------------------------ | -------- | ------------------------------------ |
| `event`  | `string`                 | Yes      | Event namespace identifier           |
| `port`   | `number`                 | Yes      | Port number for the Socket.IO server |
| `opts`   | `Partial<ServerOptions>` | Yes      | Socket.IO server options             |

### ServerOptions

The `opts` property accepts all [Socket.IO ServerOptions](https://socket.io/docs/v4/server-options/) including:

| Property                      | Type          | Default                                    | Description                   |
| ----------------------------- | ------------- | ------------------------------------------ | ----------------------------- |
| `maxHttpBufferSize`           | `number`      | `262144`                                   | Max size of HTTP buffer       |
| `cleanupEmptyChildNamespaces` | `boolean`     | `false`                                    | Auto-cleanup empty namespaces |
| `transports`                  | `string[]`    | `['websocket', 'polling', 'webtransport']` | Allowed transport protocols   |
| `connectTimeout`              | `number`      | `30000`                                    | Connection timeout in ms      |
| `pingInterval`                | `number`      | `25000`                                    | Ping interval in ms           |
| `pingTimeout`                 | `number`      | `5000`                                     | Ping timeout in ms            |
| `allowEIO3`                   | `boolean`     | `false`                                    | Allow Engine.IO v3 protocol   |
| `cors`                        | `CorsOptions` | See below                                  | CORS configuration            |

### CORS Options

```typescript
cors: {
  origin: string | string[] | RegExp | boolean;  // Default: '*'
  credentials: boolean;  // Default: true
  methods: string[];  // Default: ['GET', 'POST']
}
```

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
const config: SocketIOConfig = {
  event: "my-app",
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
