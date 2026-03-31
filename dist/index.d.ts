import { Socket, DefaultEventsMap, ServerOptions, Server, RemoteSocket, Namespace } from 'socket.io';
import { DynamicModule } from '@nestjs/common';
import Joi from 'joi';

declare const SOCKET_IO_CONFIG = "SOCKET_IO_CONFIG";
type SocketIOServerConfig = {
    port?: number;
    opts?: Partial<ServerOptions>;
};
type SocketIOModuleProps = {
    global?: boolean;
    inject?: any[];
    useFactory: (...args: any[]) => SocketIOServerConfig | Promise<SocketIOServerConfig>;
};
type SocketEventHandler<S = Socket, T = any> = (obj: {
    socket: S;
    data: T;
    ack: (ok: boolean, error?: string) => void;
}) => Promise<void> | void;
type SocketEventMap<S = Socket, T = any> = {
    [key: PropertyKey]: SocketEventHandler<S, T>;
};
type SocketEventPayload = {
    data: string;
    ack: (ok: boolean, error?: string) => void;
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, unknown>;
};

declare class SocketIOModule {
    static attach(app: any, fsio?: any): Promise<void>;
    static registerAsync(options: SocketIOModuleProps): DynamicModule;
}

declare const SocketIOConfigSchema: Joi.ObjectSchema<SocketIOServerConfig>;

declare class SocketIOService {
    private readonly _config;
    private _io;
    constructor(_config: SocketIOServerConfig);
    set io(io: Server);
    get io(): Server;
    get config(): SocketIOServerConfig;
    emit<T = unknown>(event: string, message: T): this;
    emitTo<T = unknown>(event: string, room: string, message: T): this;
    joinRoom({ socket, data, ack }: SocketEventPayload): Promise<void>;
    leaveRoom({ socket, data, ack }: SocketEventPayload): Promise<void>;
    on<T = any>(event: string | SocketEventMap, cb?: SocketEventHandler<Socket, T>): this;
    to(room: string | string[]): this;
    in(room: string | string[]): this;
    except(room: string | string[]): this;
    timeout(ms: number): this;
    fetchSockets(cb: (sockets: RemoteSocket<DefaultEventsMap, unknown>[]) => void): this;
    socketsJoin(rooms: string | string[], cb?: () => void): this;
    socketsLeave(rooms: string | string[], cb?: () => void): this;
    disconnectSockets(close?: boolean, cb?: () => void): this;
    close(cb?: () => void): this;
    of(nsp: string, cb: (ns: Namespace) => void): this;
    use(fn: (socket: Socket, next: (err?: Error) => void) => void, cb?: (server: Server) => void): this;
}

export { SOCKET_IO_CONFIG, type SocketEventHandler, type SocketEventMap, type SocketEventPayload, SocketIOConfigSchema, SocketIOModule, type SocketIOModuleProps, type SocketIOServerConfig, SocketIOService };
