import { ServerOptions, Socket } from 'socket.io';

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

export type { SocketIOConfig, SocketIOConfigFactory, SocketIOListener, SocketIOModuleProps, SocketIORecord };
