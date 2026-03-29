import { Injectable, Inject, Module, Logger } from '@nestjs/common';
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
var SOCKET_IO_LOGGER = "SOCKET_IO_LOGGER";
var SocketIOService = class {
  constructor(logger) {
    this.logger = logger;
  }
  _server = null;
  onModuleInit() {
    this.on({
      joinRoom: this.joinRoom,
      leaveRoom: this.leaveRoom
    });
  }
  set server(server) {
    this._server = server;
  }
  get server() {
    return this._server;
  }
  /**
   * Emits an event to all connected clients in the main namespace.
   * @see https://socket.io/docs/v4/server-api/#serveremiteventname-args
   */
  emit(event, message) {
    this._server?.emit(event, message);
    return this;
  }
  /**
   * Emits an event to all connected clients in the specified room.
   * @see https://socket.io/docs/v4/server-api/#serveremit-eventname-args
   */
  emitTo(event, room, message) {
    this._server?.to(room).emit(event, message);
    return this;
  }
  /**
   * Makes the socket join a room.
   * @see https://socket.io/docs/v4/server-socket-instance/#socketjoinroom
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
   * Makes the socket leave a room.
   * @see https://socket.io/docs/v4/server-socket-instance/#socketleaveroom
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
   * Registers an event handler for incoming connections or subscribes to events.
   * @see https://socket.io/docs/v4/server-api/#serveroneventname-listener
   */
  on(event, cb) {
    if (typeof event === "string" && cb) {
      this.logger.log(`Subscribed to event: "${event}"`, "Socket.IO");
      this._server?.on("connection", (socket) => {
        socket.on(event, async (data, ack) => {
          await cb({ socket, data, ack });
        });
      });
    }
    if (typeof event === "object" && !cb) {
      this.logger.log(`Subscribed to messages: ${JSON.stringify(Object.keys(event))}`, "Socket.IO");
      this._server?.on(
        "connection",
        (socket) => Object.entries(event).forEach(
          ([key, cb2]) => socket.on(key, async (data, ack) => await cb2({ socket, data, ack }))
        )
      );
    }
    return this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the event will only be\
   * broadcast to clients that have joined the given room.
   * @see https://socket.io/docs/v4/server-api/#servertoroom
   */
  to(room) {
    this._server?.to(room);
    return this;
  }
  /**
   * Alias for to(). Sets a modifier for a subsequent event emission.
   * @see https://socket.io/docs/v4/server-api/#serverinroom
   */
  in(room) {
    this._server?.in(room);
    return this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the event will only be\
   * broadcast to clients that have not joined the given rooms.
   * @see https://socket.io/docs/v4/server-api/#serverexceptrooms
   */
  except(room) {
    this._server?.except(room);
    return this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the callback will be called\
   * with an error when the given number of milliseconds have elapsed without an\
   * acknowledgement from all targeted clients.
   * @see https://socket.io/docs/v4/server-api/#servertimeoutvalue
   */
  timeout(ms) {
    this._server?.timeout(ms);
    return this;
  }
  /**
   * Returns the matching Socket instances.
   * @see https://socket.io/docs/v4/server-api/#serverfetchsockets
   */
  fetchSockets(cb) {
    void this._server?.fetchSockets().then(cb);
    return this;
  }
  /**
   * Makes all Socket instances join the specified rooms.
   * @see https://socket.io/docs/v4/server-api/#serversocketsjoinrooms
   */
  socketsJoin(rooms, cb) {
    this._server?.socketsJoin(rooms);
    cb?.();
    return this;
  }
  /**
   * Makes all Socket instances leave the specified rooms.
   * @see https://socket.io/docs/v4/server-api/#serversocketsleaverooms
   */
  socketsLeave(rooms, cb) {
    this._server?.socketsLeave(rooms);
    cb?.();
    return this;
  }
  /**
   * Makes the matching Socket instances disconnect.
   * @see https://socket.io/docs/v4/server-api/#serverdisconnectsocketsclose
   */
  disconnectSockets(close, cb) {
    void this._server?.disconnectSockets(close);
    cb?.();
    return this;
  }
  /**
   * Closes the Socket.IO server and disconnects all clients.
   * @see https://socket.io/docs/v4/server-api/#serverclosecallback
   */
  close(cb) {
    if (cb) {
      this._server?.close(cb);
    } else {
      this._server?.close();
    }
    return this;
  }
  /**
   * Initializes and retrieves the given Namespace by its pathname identifier.
   * @see https://socket.io/docs/v4/server-api/#serverofnsp
   */
  of(nsp, cb) {
    cb(this._server?.of(nsp));
    return this;
  }
  /**
   * Registers a middleware for the main namespace.
   * @see https://socket.io/docs/v4/server-api/#serverusefn
   */
  use(fn, cb) {
    this._server?.use(fn);
    cb?.(this._server);
    return this;
  }
};
SocketIOService = __decorateClass([
  Injectable(),
  __decorateParam(0, Inject(SOCKET_IO_LOGGER))
], SocketIOService);

// src/module/socket-io.module.ts
var SocketIOModule = class {
  static registerAsync(options) {
    return {
      module: SocketIOModule,
      global: options.global,
      exports: [SocketIOService],
      providers: [{ provide: SOCKET_IO_LOGGER, useValue: new Logger(SocketIOService.name) }, SocketIOService]
    };
  }
};
SocketIOModule = __decorateClass([
  Module({})
], SocketIOModule);
var SocketIOConfigSchema = Joi.object({
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
  }).optional()
});

export { SOCKET_IO_LOGGER, SocketIOConfigSchema, SocketIOModule, SocketIOService };
