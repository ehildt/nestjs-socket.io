# @ehildt/nestjs-socket.io

## 1.3.2

### Patch Changes

- a7377e0: Fix TypeScript type errors in socket-io.module.ts attach function by using INestApplicationExtended type

## 1.3.0

### Minor Changes

- 9675c56: Remove automatic registration of joinRoom/leaveRoom handlers and remove built-in logger.
  Added new attach method to SocketIOModule
  Auto-detects Fastify or Express adapter and attaches Socket.IO to the NestJS application.

## 1.2.7

### Patch Changes

- d0710bf: Add llm.txt documentation for AI/LLM usage

## 1.2.6

### Patch Changes

- a3028d0: Allow useFactory to accept injected dependencies via ...args

## 1.2.5

### Patch Changes

- 9a9e25d: Rename `server` to `io` in SocketIOService and add SOCKET_IO_CONFIG provider

## 1.2.2

### Patch Changes

- f800953: Add repository links to dependency badges

## 1.2.1

### Patch Changes

- 044aced: Improve package.json description

## 1.2.0

### Minor Changes

- 66a7713: Add delegated Socket.IO server methods with chaining support for room management, broadcasting, and middleware. Remove deprecated `event` field from config. Update wiki with Fastify integration docs.

## 1.1.0

### Minor Changes

- 545f5c6: Consolidate folder structure and exports
  - Remove individual index.ts files in subdirectories, use single src/index.ts
  - Update package.json exports to single entry point
  - Add main.ts setup instructions to wiki documentation
  - Fix wiki filename typos (socket-iomodule -> socket-io.module)

## 1.0.0

### Major Changes

- 03e8508: removed root exports path

## 0.1.0

### Minor Changes

- 6ebb1fe: Refactor exports to enable tree-shaking via subpath entries
