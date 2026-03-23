import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { DefaultEventsMap, Server, Socket } from "socket.io";

import { SOCKET_IO_SERVER } from "../constants/socket-io.constants.ts";
import { SocketIOListener, SocketIORecord } from "../models/socket-io.model.ts";

@Injectable()
export class SocketIOService implements OnModuleInit {
  constructor(private readonly logger: Logger, @Inject(SOCKET_IO_SERVER) private readonly _server: Server) {}

  onModuleInit() {
    this.on({
      joinRoom: this.joinRoom.bind(this),
      leaveRoom: this.leaveRoom.bind(this),
    });
  }

  get server() {
    return this._server;
  }

  public emit<T = unknown>(event: string, message: T) {
    this._server.emit(event, message);
    return this;
  }

  public emitTo<T = unknown>(event: string, room: string, message: T) {
    this._server.to(room).emit(event, message);
    return this;
  }

  async joinRoom({ socket, data, ack }: SocketListener) {
    this.logger.log("attempting to join room", data);
    try {
      await socket.join(data);
      ack(true);
      this.logger.log(`client with id ${socket.id} joined room ${data}`, "Socket.IO");
    } catch (error: unknown) {
      const err = error as Error;
      ack(false, err.message);
      this.logger.log(`client with id ${socket.id} error joining room ${data}`, "Socket.IO");
    }
  }

  async leaveRoom({ socket, data, ack }: SocketListener) {
    this.logger.log("attempting to leave room", data);
    try {
      await socket.leave(data);
      ack(true);
      this.logger.log(`client with id ${socket.id} left room ${data}`, "Socket.IO");
    } catch (error: unknown) {
      const err = error as Error;
      ack(false, err.message);
      this.logger.log(`client with id ${socket.id} error leaving room ${data}`, "Socket.IO");
    }
  }

  public on<T = any>(event: string | SocketIORecord, cb?: SocketIOListener<Socket, T>) {
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
      this._server.on("connection", (socket) =>
        Object.entries(event).forEach(([key, cb]) =>
          socket.on(key, async (data, ack) => await cb({ socket, data, ack })),
        ),
      );
    }

    return this;
  }
}

type SocketListener = {
  data: string;
  ack: (ok: boolean, error?: string) => void;
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>;
};
