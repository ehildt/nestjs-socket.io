import { ServerOptions, Socket, Server, DefaultEventsMap } from "socket.io";
import { DynamicModule, OnModuleInit, Logger } from "@nestjs/common";
import Joi from "joi";

declare const SOCKET_IO_SERVER: unique symbol;
type SOCKET_IO_EVENT_TYPE = "topic" | "thread" | "post" | "vision" | "tool";
declare const SOCKET_IO_EVENT: Record<string, SOCKET_IO_EVENT_TYPE>;

type SocketIOConfig = {
  event: string;
  port: number;
  opts: Partial<ServerOptions>;
};
type SocketIOConfigFactory = (...deps: Array<any>) => Promise<SocketIOConfig>;
type SocketIOModuleProps = {
  global?: boolean;
  inject: Array<any>;
  useFactory: SocketIOConfigFactory;
};
type SocketIOListener<S = Socket, T = any> = (obj: {
  socket: S;
  data: T;
  ack: (ok: boolean, error?: string) => void;
}) => Promise<void> | void;
type SocketIORecord<S = Socket, T = any> = {
  [key: PropertyKey]: SocketIOListener<S, T>;
};

declare class SocketIOModule {
  static registerAsync(options: SocketIOModuleProps): DynamicModule;
}

declare const SocketIOConfigSchema: Joi.ObjectSchema<SocketIOConfig>;

declare class SocketIOService implements OnModuleInit {
  private readonly logger;
  private readonly _server;
  constructor(logger: Logger, _server: Server);
  onModuleInit(): void;
  get server(): Server<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    any
  >;
  emit<T = unknown>(event: string, message: T): this;
  emitTo<T = unknown>(event: string, room: string, message: T): this;
  joinRoom({ socket, data, ack }: SocketListener): Promise<void>;
  leaveRoom({ socket, data, ack }: SocketListener): Promise<void>;
  on<T = any>(
    event: string | SocketIORecord,
    cb?: SocketIOListener<Socket, T>
  ): this;
}
type SocketListener = {
  data: string;
  ack: (ok: boolean, error?: string) => void;
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>;
};

export {
  SOCKET_IO_EVENT,
  type SOCKET_IO_EVENT_TYPE,
  SOCKET_IO_SERVER,
  type SocketIOConfig,
  type SocketIOConfigFactory,
  SocketIOConfigSchema,
  type SocketIOListener,
  SocketIOModule,
  type SocketIOModuleProps,
  type SocketIORecord,
  SocketIOService,
};
