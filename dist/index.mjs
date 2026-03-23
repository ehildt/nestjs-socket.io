import { Injectable, Inject, Module, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import Joi from 'joi';

var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (decorator(result)) || result;
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);

// src/socket-io.constants.ts
var SOCKET_IO_SERVER = /* @__PURE__ */ Symbol("SOCKET.IO");
var SOCKET_IO_EVENT = Object.freeze({
  TOPIC: "topic",
  THREAD: "thread",
  POST: "post",
  VISION: "vision",
  TOOL: "tool"
});
var SocketIOService = class {
  /**
   * @internal
   */
  constructor(logger, _server) {
    this.logger = logger;
    this._server = _server;
  }
  /**
   * @internal
   */
  onModuleInit() {
    this.on({
      joinRoom: this.joinRoom.bind(this),
      leaveRoom: this.leaveRoom.bind(this)
    });
  }
  /**
   * Access to the underlying Socket.IO server instance.
   *
   * @returns The Socket.IO Server instance
   *
   * @example
   * ```typescript
   * const ioServer = this.socketService.server;
   * ```
   */
  get server() {
    return this._server;
  }
  /**
   * Broadcasts an event to all connected clients.
   *
   * @template T - Type of the message payload
   * @param event - Event name
   * @param message - Data to send
   * @returns This service instance for method chaining
   *
   * @example
   * ```typescript
   * socketService.emit('notification', { title: 'Hello', body: 'World' });
   * ```
   */
  emit(event, message) {
    this._server.emit(event, message);
    return this;
  }
  /**
   * Sends an event to all clients in a specific room.
   *
   * @template T - Type of the message payload
   * @param event - Event name
   * @param room - Room identifier
   * @param message - Data to send
   * @returns This service instance for method chaining
   *
   * @example
   * ```typescript
   * socketService.emitTo('room-message', 'room-123', { content: 'Hello!' });
   * ```
   */
  emitTo(event, room, message) {
    this._server.to(room).emit(event, message);
    return this;
  }
  /**
   * Handles room join requests from clients.
   * Clients should emit 'joinRoom' with the room name.
   *
   * @param listener - Socket listener with room name in data
   *
   * @example
   * ```typescript
   * // Client-side
   * socket.emit('joinRoom', 'my-room', (ok, error) => {
   *   if (ok) console.log('Joined!');
   * });
   * ```
   */
  async joinRoom({ socket, data, ack }) {
    this.logger.log("attempting to join room", data);
    try {
      await socket.join(data);
      ack(true);
      this.logger.log(`client with id ${socket.id} joined room ${data}`, "Socket.IO");
    } catch (error) {
      const err = error;
      ack(false, err.message);
      this.logger.log(`client with id ${socket.id} error joining room ${data}`, "Socket.IO");
    }
  }
  /**
   * Handles room leave requests from clients.
   * Clients should emit 'leaveRoom' with the room name.
   *
   * @param listener - Socket listener with room name in data
   *
   * @example
   * ```typescript
   * // Client-side
   * socket.emit('leaveRoom', 'my-room', (ok, error) => {
   *   if (ok) console.log('Left!');
   * });
   * ```
   */
  async leaveRoom({ socket, data, ack }) {
    this.logger.log("attempting to leave room", data);
    try {
      await socket.leave(data);
      ack(true);
      this.logger.log(`client with id ${socket.id} left room ${data}`, "Socket.IO");
    } catch (error) {
      const err = error;
      ack(false, err.message);
      this.logger.log(`client with id ${socket.id} error leaving room ${data}`, "Socket.IO");
    }
  }
  /**
   * Subscribes to events from connected clients.
   *
   * @template T - Type of the data payload
   * @param event - Event name string OR record of event handlers
   * @param callback - Callback function (only if event is a string)
   * @returns This service instance for method chaining
   *
   * @example
   * // Single event
   * ```typescript
   * socketService.on('chat-message', async ({ socket, data, ack }) => {
   *   console.log('Message:', data);
   *   ack(true);
   * });
   * ```
   *
   * @example
   * // Multiple events
   * ```typescript
   * socketService.on({
   *   joinRoom: async ({ socket, data, ack }) => {
   *     await socket.join(data);
   *     ack(true);
   *   },
   *   leaveRoom: async ({ socket, data, ack }) => {
   *     await socket.leave(data);
   *     ack(true);
   *   },
   * });
   * ```
   */
  on(event, cb) {
    if (typeof event === "string" && cb) {
      this.logger.log(`Subscribed to event: "${event}"`, "Socket.IO");
      this._server.on("connection", (socket) => {
        socket.on(event, async (data, ack) => {
          await cb({ socket, data, ack });
        });
      });
    }
    if (typeof event === "object" && !cb) {
      this.logger.log(`Subscribed to messages: ${JSON.stringify(Object.keys(event))}`, "Socket.IO");
      this._server.on(
        "connection",
        (socket) => Object.entries(event).forEach(
          ([key, cb2]) => socket.on(key, async (data, ack) => await cb2({ socket, data, ack }))
        )
      );
    }
    return this;
  }
};
SocketIOService = __decorateClass([
  Injectable(),
  __decorateParam(1, Inject(SOCKET_IO_SERVER))
], SocketIOService);

// src/socket-io.module.ts
var SocketIOModule = class {
  /**
   * Registers the SocketIOModule asynchronously.
   *
   * @param options - Configuration options for the module
   * @param options.global - Whether to make the module globally available
   * @param options.inject - Array of dependency injection tokens
   * @param options.useFactory - Factory function that returns SocketIOConfig
   * @returns Dynamic module configuration
   *
   * @example
   * ```typescript
   * SocketIOModule.registerAsync({
   *   global: true,
   *   inject: [SocketIOConfigService],
   *   useFactory: async (config: SocketIOConfigService) => config.config,
   * });
   * ```
   */
  static registerAsync(options) {
    return {
      module: SocketIOModule,
      global: options.global,
      exports: [SOCKET_IO_SERVER, SocketIOService],
      providers: [
        Logger,
        SocketIOService,
        {
          provide: SOCKET_IO_SERVER,
          inject: options.inject,
          useFactory: async (...deps) => {
            const { port, opts } = await options.useFactory(...deps);
            return new Server(port, opts);
          }
        }
      ]
    };
  }
};
SocketIOModule = __decorateClass([
  Module({})
], SocketIOModule);
var SocketIOConfigSchema = Joi.object({
  event: Joi.string().optional(),
  port: Joi.number().required(),
  opts: Joi.object({
    cleanupEmptyChildNamespaces: Joi.boolean().required(),
    maxHttpBufferSize: Joi.number().required(),
    pingInterval: Joi.number().required(),
    pingTimeout: Joi.number().optional(),
    connectTimeout: Joi.number().required(),
    allowEIO3: Joi.boolean().required(),
    transports: Joi.array().items(Joi.string().valid("websocket", "polling", "webtransport")).required(),
    cors: Joi.object({
      origin: Joi.string().allow("*").required(),
      credentials: Joi.boolean().required(),
      methods: Joi.array().items(Joi.string().valid("GET", "POST")).required()
    }).required()
  }).required()
});

export { SOCKET_IO_EVENT, SOCKET_IO_SERVER, SocketIOConfigSchema, SocketIOModule, SocketIOService };
