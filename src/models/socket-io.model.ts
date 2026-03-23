import { ServerOptions, Socket } from "socket.io";

export type SocketIOConfig = {
  event: string;
  port: number;
  opts: Partial<ServerOptions>;
};

export type SocketIOConfigFactory = (...deps: Array<any>) => Promise<SocketIOConfig>;

export type SocketIOModuleProps = {
  global?: boolean;
  inject: Array<any>;
  useFactory: SocketIOConfigFactory;
};

export type SocketIOListener<S = Socket, T = any> = (obj: {
  socket: S;
  data: T;
  ack: (ok: boolean, error?: string) => void;
}) => Promise<void> | void;

export type SocketIORecord<S = Socket, T = any> = {
  [key: PropertyKey]: SocketIOListener<S, T>;
};
