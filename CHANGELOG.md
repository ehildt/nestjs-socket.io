# @ehildt/nestjs-socket.io

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
