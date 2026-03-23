import { Injectable, Inject } from '@nestjs/common';

var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (decorator(result)) || result;
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);

// src/constants/socket-io.constants.ts
var SOCKET_IO_SERVER = /* @__PURE__ */ Symbol("SOCKET.IO");

// src/service/socket-io.service.ts
var SocketIOService = class {
  constructor(logger, _server) {
    this.logger = logger;
    this._server = _server;
  }
  onModuleInit() {
    this.on({
      joinRoom: this.joinRoom.bind(this),
      leaveRoom: this.leaveRoom.bind(this)
    });
  }
  get server() {
    return this._server;
  }
  emit(event, message) {
    this._server.emit(event, message);
    return this;
  }
  emitTo(event, room, message) {
    this._server.to(room).emit(event, message);
    return this;
  }
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

export { SocketIOService };
