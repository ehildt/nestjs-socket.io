import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { DefaultEventsMap, Namespace, RemoteSocket, Server, Socket } from "socket.io";

import { SocketEventHandler, SocketEventMap, SocketEventPayload } from "../models/socket-io.model.ts";

export const SOCKET_IO_LOGGER = "SOCKET_IO_LOGGER";

@Injectable()
export class SocketIOService implements OnModuleInit {
  private _server: Server | null = null;
  constructor(@Inject(SOCKET_IO_LOGGER) private readonly logger: Logger) {}

  onModuleInit() {
    this.on({
      joinRoom: this.joinRoom,
      leaveRoom: this.leaveRoom,
    });
  }

  set server(server: Server) {
    this._server = server;
  }

  get server() {
    return this._server as Server;
  }

  /**
   * Emits an event to all connected clients in the main namespace.
   * @see https://socket.io/docs/v4/server-api/#serveremiteventname-args
   */
  public emit<T = unknown>(event: string, message: T) {
    this._server?.emit(event, message);
    return this;
  }

  /**
   * Emits an event to all connected clients in the specified room.
   * @see https://socket.io/docs/v4/server-api/#serveremit-eventname-args
   */
  public emitTo<T = unknown>(event: string, room: string, message: T) {
    this._server?.to(room).emit(event, message);
    return this;
  }

  /**
   * Makes the socket join a room.
   * @see https://socket.io/docs/v4/server-socket-instance/#socketjoinroom
   */
  public async joinRoom({ socket, data, ack }: SocketEventPayload) {
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

  /**
   * Makes the socket leave a room.
   * @see https://socket.io/docs/v4/server-socket-instance/#socketleaveroom
   */
  public async leaveRoom({ socket, data, ack }: SocketEventPayload) {
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

  /**
   * Registers an event handler for incoming connections or subscribes to events.
   * @see https://socket.io/docs/v4/server-api/#serveroneventname-listener
   */
  public on<T = any>(event: string | SocketEventMap, cb?: SocketEventHandler<Socket, T>) {
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
      this._server?.on("connection", (socket) =>
        Object.entries(event).forEach(([key, cb]) =>
          socket.on(key, async (data, ack) => await cb({ socket, data, ack })),
        ),
      );
    }

    return this;
  }

  /**
   * Sets a modifier for a subsequent event emission that the event will only be\
   * broadcast to clients that have joined the given room.
   * @see https://socket.io/docs/v4/server-api/#servertoroom
   */
  public to(room: string | string[]): this {
    this._server?.to(room);
    return this;
  }

  /**
   * Alias for to(). Sets a modifier for a subsequent event emission.
   * @see https://socket.io/docs/v4/server-api/#serverinroom
   */
  public in(room: string | string[]): this {
    this._server?.in(room);
    return this;
  }

  /**
   * Sets a modifier for a subsequent event emission that the event will only be\
   * broadcast to clients that have not joined the given rooms.
   * @see https://socket.io/docs/v4/server-api/#serverexceptrooms
   */
  public except(room: string | string[]): this {
    this._server?.except(room);
    return this;
  }

  /**
   * Sets a modifier for a subsequent event emission that the callback will be called\
   * with an error when the given number of milliseconds have elapsed without an\
   * acknowledgement from all targeted clients.
   * @see https://socket.io/docs/v4/server-api/#servertimeoutvalue
   */
  public timeout(ms: number): this {
    this._server?.timeout(ms);
    return this;
  }

  /**
   * Returns the matching Socket instances.
   * @see https://socket.io/docs/v4/server-api/#serverfetchsockets
   */
  public fetchSockets(cb: (sockets: RemoteSocket<DefaultEventsMap, unknown>[]) => void): this {
    void this._server?.fetchSockets().then(cb);
    return this;
  }

  /**
   * Makes all Socket instances join the specified rooms.
   * @see https://socket.io/docs/v4/server-api/#serversocketsjoinrooms
   */
  public socketsJoin(rooms: string | string[], cb?: () => void): this {
    this._server?.socketsJoin(rooms);
    cb?.();
    return this;
  }

  /**
   * Makes all Socket instances leave the specified rooms.
   * @see https://socket.io/docs/v4/server-api/#serversocketsleaverooms
   */
  public socketsLeave(rooms: string | string[], cb?: () => void): this {
    this._server?.socketsLeave(rooms);
    cb?.();
    return this;
  }

  /**
   * Makes the matching Socket instances disconnect.
   * @see https://socket.io/docs/v4/server-api/#serverdisconnectsocketsclose
   */
  public disconnectSockets(close?: boolean, cb?: () => void): this {
    void this._server?.disconnectSockets(close);
    cb?.();
    return this;
  }

  /**
   * Closes the Socket.IO server and disconnects all clients.
   * @see https://socket.io/docs/v4/server-api/#serverclosecallback
   */
  public close(cb?: () => void): this {
    if (cb) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this._server?.close(cb);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this._server?.close();
    }
    return this;
  }

  /**
   * Initializes and retrieves the given Namespace by its pathname identifier.
   * @see https://socket.io/docs/v4/server-api/#serverofnsp
   */
  public of(nsp: string, cb: (ns: Namespace) => void): this {
    cb(this._server?.of(nsp) as Namespace);
    return this;
  }

  /**
   * Registers a middleware for the main namespace.
   * @see https://socket.io/docs/v4/server-api/#serverusefn
   */
  public use(fn: (socket: Socket, next: (err?: Error) => void) => void, cb?: (server: Server) => void): this {
    this._server?.use(fn);
    cb?.(this._server as Server);
    return this;
  }
}
