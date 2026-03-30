import { Injectable, Inject, Module } from '@nestjs/common';
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

// src/models/socket-io.model.ts
var SOCKET_IO_CONFIG = "SOCKET_IO_CONFIG";
var SocketIOService = class {
  constructor(_config) {
    this._config = _config;
  }
  _io = null;
  set io(io) {
    this._io = io;
  }
  get io() {
    return this._io;
  }
  get config() {
    return this._config;
  }
  /**
   * Emits an event to all connected clients in the main namespace.
   * @see https://socket.io/docs/v4/server-api/#serveremiteventname-args
   */
  emit(event, message) {
    this._io?.emit(event, message);
    return this;
  }
  /**
   * Emits an event to all connected clients in the specified room.
   * @see https://socket.io/docs/v4/server-api/#serveremit-eventname-args
   */
  emitTo(event, room, message) {
    this._io?.to(room).emit(event, message);
    return this;
  }
  /**
   * Makes the socket join a room.
   * @see https://socket.io/docs/v4/server-socket-instance/#socketjoinroom
   */
  async joinRoom({ socket, data, ack }) {
    try {
      await socket.join(data);
      ack(true);
    } catch (error) {
      const err = error;
      ack(false, err.message);
    }
  }
  /**
   * Makes the socket leave a room.
   * @see https://socket.io/docs/v4/server-socket-instance/#socketleaveroom
   */
  async leaveRoom({ socket, data, ack }) {
    try {
      await socket.leave(data);
      ack(true);
    } catch (error) {
      const err = error;
      ack(false, err.message);
    }
  }
  /**
   * Registers an event handler for incoming connections or subscribes to events.
   * @see https://socket.io/docs/v4/server-api/#serveroneventname-listener
   */
  on(event, cb) {
    if (typeof event === "string" && cb) {
      this._io?.on("connection", (socket) => {
        socket.on(event, async (data, ack) => {
          await cb({ socket, data, ack });
        });
      });
    }
    if (typeof event === "object" && !cb) {
      this._io?.on(
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
    this._io?.to(room);
    return this;
  }
  /**
   * Alias for to(). Sets a modifier for a subsequent event emission.
   * @see https://socket.io/docs/v4/server-api/#serverinroom
   */
  in(room) {
    this._io?.in(room);
    return this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the event will only be\
   * broadcast to clients that have not joined the given rooms.
   * @see https://socket.io/docs/v4/server-api/#serverexceptrooms
   */
  except(room) {
    this._io?.except(room);
    return this;
  }
  /**
   * Sets a modifier for a subsequent event emission that the callback will be called\
   * with an error when the given number of milliseconds have elapsed without an\
   * acknowledgement from all targeted clients.
   * @see https://socket.io/docs/v4/server-api/#servertimeoutvalue
   */
  timeout(ms) {
    this._io?.timeout(ms);
    return this;
  }
  /**
   * Returns the matching Socket instances.
   * @see https://socket.io/docs/v4/server-api/#serverfetchsockets
   */
  fetchSockets(cb) {
    void this._io?.fetchSockets().then(cb);
    return this;
  }
  /**
   * Makes all Socket instances join the specified rooms.
   * @see https://socket.io/docs/v4/server-api/#serversocketsjoinrooms
   */
  socketsJoin(rooms, cb) {
    this._io?.socketsJoin(rooms);
    cb?.();
    return this;
  }
  /**
   * Makes all Socket instances leave the specified rooms.
   * @see https://socket.io/docs/v4/server-api/#serversocketsleaverooms
   */
  socketsLeave(rooms, cb) {
    this._io?.socketsLeave(rooms);
    cb?.();
    return this;
  }
  /**
   * Makes the matching Socket instances disconnect.
   * @see https://socket.io/docs/v4/server-api/#serverdisconnectsocketsclose
   */
  disconnectSockets(close, cb) {
    void this._io?.disconnectSockets(close);
    cb?.();
    return this;
  }
  /**
   * Closes the Socket.IO server and disconnects all clients.
   * @see https://socket.io/docs/v4/server-api/#serverclosecallback
   */
  close(cb) {
    if (cb) {
      this._io?.close(cb);
    } else {
      this._io?.close();
    }
    return this;
  }
  /**
   * Initializes and retrieves the given Namespace by its pathname identifier.
   * @see https://socket.io/docs/v4/server-api/#serverofnsp
   */
  of(nsp, cb) {
    cb(this._io?.of(nsp));
    return this;
  }
  /**
   * Registers a middleware for the main namespace.
   * @see https://socket.io/docs/v4/server-api/#serverusefn
   */
  use(fn, cb) {
    this._io?.use(fn);
    cb?.(this._io);
    return this;
  }
};
SocketIOService = __decorateClass([
  Injectable(),
  __decorateParam(0, Inject(SOCKET_IO_CONFIG))
], SocketIOService);

// src/module/socket-io.module.ts
var SocketIOModule = class {
  static registerAsync(options) {
    return {
      module: SocketIOModule,
      global: options.global,
      exports: [SocketIOService],
      providers: [
        SocketIOService,
        {
          inject: options.inject,
          provide: SOCKET_IO_CONFIG,
          useFactory: options.useFactory
        }
      ]
    };
  }
};
SocketIOModule = __decorateClass([
  Module({})
], SocketIOModule);
var SocketIOConfigSchema = Joi.object({
  port: Joi.number().optional(),
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

export { SOCKET_IO_CONFIG, SocketIOConfigSchema, SocketIOModule, SocketIOService };
