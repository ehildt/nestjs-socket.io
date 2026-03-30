import { DefaultEventsMap, ServerOptions, Socket } from "socket.io";

export const SOCKET_IO_CONFIG = "SOCKET_IO_CONFIG";

export type SocketIOServerConfig = {
  port?: number;
  opts?: Partial<ServerOptions>;
};

export type SocketIOModuleProps = {
  global?: boolean;
  inject?: any[];
  useFactory: (...args: any[]) => SocketIOServerConfig | Promise<SocketIOServerConfig>;
};

export type SocketEventHandler<S = Socket, T = any> = (obj: {
  socket: S;
  data: T;
  ack: (ok: boolean, error?: string) => void;
}) => Promise<void> | void;

export type SocketEventMap<S = Socket, T = any> = {
  [key: PropertyKey]: SocketEventHandler<S, T>;
};

export type SocketEventPayload = {
  data: string;
  ack: (ok: boolean, error?: string) => void;
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>;
};
